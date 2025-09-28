const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PriceOracle", function () {
  let priceOracle;
  let owner;
  let oracle;
  let unauthorized;
  let appId;

  beforeEach(async function () {
    [owner, oracle, unauthorized] = await ethers.getSigners();
    appId = "test-rofl-app";

    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    priceOracle = await PriceOracle.deploy(appId, oracle.address);
    await priceOracle.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await priceOracle.owner()).to.equal(owner.address);
    });

    it("Should authorize the initial app and oracle", async function () {
      expect(await priceOracle.authorizedApps(appId)).to.be.true;
      expect(await priceOracle.authorizedOracles(oracle.address)).to.be.true;
    });
  });

  describe("Price Updates", function () {
    let validAttestation;
    let price;
    let timestamp;

    beforeEach(async function () {
      price = ethers.parseUnits("2000", 8); // $2000
      timestamp = Math.floor(Date.now() / 1000);
      
      // Create a valid attestation
      const priceDataBytes = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256", "string"],
        [price, timestamp, "coingecko"]
      );
      
      validAttestation = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "uint256", "bytes", "bytes", "bytes32"],
        [
          appId,
          timestamp,
          priceDataBytes,
          "0x1234", // mock TEE quote
          ethers.keccak256(ethers.toUtf8Bytes("mock-signature"))
        ]
      );
    });

    it("Should accept price updates from authorized oracle", async function () {
      await expect(
        priceOracle.connect(oracle).updatePrice(price, timestamp, validAttestation)
      ).to.emit(priceOracle, "PriceUpdated")
        .withArgs(price, timestamp, oracle.address, appId);

      const [latestPrice, latestTimestamp] = await priceOracle.getLatestPrice();
      expect(latestPrice).to.equal(price);
      expect(latestTimestamp).to.equal(timestamp);
    });

    it("Should reject price updates from unauthorized oracle", async function () {
      await expect(
        priceOracle.connect(unauthorized).updatePrice(price, timestamp, validAttestation)
      ).to.be.revertedWithCustomError(priceOracle, "UnauthorizedOracle");
    });

    it("Should reject zero price", async function () {
      await expect(
        priceOracle.connect(oracle).updatePrice(0, timestamp, validAttestation)
      ).to.be.revertedWithCustomError(priceOracle, "InvalidPriceData");
    });

    it("Should reject old timestamps", async function () {
      const oldTimestamp = Math.floor(Date.now() / 1000) - 7200; // 2 hours ago
      
      const oldPriceDataBytes = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256", "string"],
        [price, oldTimestamp, "coingecko"]
      );
      
      const oldAttestation = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "uint256", "bytes", "bytes", "bytes32"],
        [
          appId,
          oldTimestamp,
          oldPriceDataBytes,
          "0x1234",
          ethers.keccak256(ethers.toUtf8Bytes("mock-signature"))
        ]
      );

      await expect(
        priceOracle.connect(oracle).updatePrice(price, oldTimestamp, oldAttestation)
      ).to.be.revertedWithCustomError(priceOracle, "PriceTooOld");
    });
  });

  describe("Thresholds", function () {
    beforeEach(async function () {
      // Set thresholds: $1500 - $2500
      const lowerBound = ethers.parseUnits("1500", 8);
      const upperBound = ethers.parseUnits("2500", 8);
      await priceOracle.setThresholds(upperBound, lowerBound, true);
    });

    it("Should emit threshold breach event for high price", async function () {
      const highPrice = ethers.parseUnits("3000", 8); // Above upper bound
      const timestamp = Math.floor(Date.now() / 1000);
      
      const highPriceDataBytes = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256", "string"],
        [highPrice, timestamp, "coingecko"]
      );
      
      const attestation = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "uint256", "bytes", "bytes", "bytes32"],
        [
          appId,
          timestamp,
          highPriceDataBytes,
          "0x1234",
          ethers.keccak256(ethers.toUtf8Bytes("mock-signature"))
        ]
      );

      await expect(
        priceOracle.connect(oracle).updatePrice(highPrice, timestamp, attestation)
      ).to.emit(priceOracle, "ThresholdBreached")
        .withArgs(highPrice, true, ethers.parseUnits("2500", 8));
    });

    it("Should emit threshold breach event for low price", async function () {
      const lowPrice = ethers.parseUnits("1000", 8); // Below lower bound
      const timestamp = Math.floor(Date.now() / 1000);
      
      const lowPriceDataBytes = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256", "string"],
        [lowPrice, timestamp, "coingecko"]
      );
      
      const attestation = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "uint256", "bytes", "bytes", "bytes32"],
        [
          appId,
          timestamp,
          lowPriceDataBytes,
          "0x1234",
          ethers.keccak256(ethers.toUtf8Bytes("mock-signature"))
        ]
      );

      await expect(
        priceOracle.connect(oracle).updatePrice(lowPrice, timestamp, attestation)
      ).to.emit(priceOracle, "ThresholdBreached")
        .withArgs(lowPrice, false, ethers.parseUnits("1500", 8));
    });

    it("Should check if price is within thresholds", async function () {
      const withinPrice = ethers.parseUnits("2000", 8);
      const abovePrice = ethers.parseUnits("3000", 8);
      const belowPrice = ethers.parseUnits("1000", 8);

      expect(await priceOracle.isPriceWithinThresholds(withinPrice)).to.be.true;
      expect(await priceOracle.isPriceWithinThresholds(abovePrice)).to.be.false;
      expect(await priceOracle.isPriceWithinThresholds(belowPrice)).to.be.false;
    });
  });

  describe("Authorization Management", function () {
    it("Should allow owner to authorize/deauthorize apps", async function () {
      const newAppId = "new-test-app";
      
      await expect(priceOracle.setAppAuthorization(newAppId, true))
        .to.emit(priceOracle, "AppAuthorized")
        .withArgs(newAppId, true);
      
      expect(await priceOracle.authorizedApps(newAppId)).to.be.true;
      
      await priceOracle.setAppAuthorization(newAppId, false);
      expect(await priceOracle.authorizedApps(newAppId)).to.be.false;
    });

    it("Should allow owner to authorize/deauthorize oracles", async function () {
      await expect(priceOracle.setOracleAuthorization(unauthorized.address, true))
        .to.emit(priceOracle, "OracleAuthorized")
        .withArgs(unauthorized.address, true);
      
      expect(await priceOracle.authorizedOracles(unauthorized.address)).to.be.true;
    });

    it("Should reject authorization changes from non-owner", async function () {
      await expect(
        priceOracle.connect(unauthorized).setAppAuthorization("test", true)
      ).to.be.revertedWithCustomError(priceOracle, "OwnableUnauthorizedAccount");
    });
  });
});
