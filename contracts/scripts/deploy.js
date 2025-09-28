const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Deploying Price Oracle contract...");
  
  // Check configuration
  const hasValidPrivateKey = process.env.PRIVATE_KEY && 
                            process.env.PRIVATE_KEY !== 'your_private_key_here' && 
                            process.env.PRIVATE_KEY.length >= 64;
  
  const hasValidMnemonic = (process.env.MNEMONIC && process.env.MNEMONIC !== 'your_mnemonic_phrase_here') ||
                          (process.env.MNENOMICS && process.env.MNENOMICS !== 'your_mnemonic_phrase_here');
  
  if (!hasValidPrivateKey && !hasValidMnemonic) {
    throw new Error("Please set either a valid PRIVATE_KEY (64+ characters) or MNEMONIC/MNENOMICS in your .env file");
  }
  
  // Get the deployer account
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No signers available. Check your private key and network configuration.");
  }
  
  const deployer = signers[0];
  const deployerAddress = await deployer.getAddress();
  console.log("Deploying with account:", deployerAddress);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployerAddress);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Configuration
  const initialAppId = process.env.ROFL_APP_ID || "demo-price-oracle-rofl";
  const initialOracle = deployerAddress; // Use deployer as initial oracle
  
  console.log("Initial ROFL App ID:", initialAppId);
  console.log("Initial Oracle Address:", initialOracle);
  
  // Deploy the contract
  const PriceOracle = await ethers.getContractFactory("PriceOracle");
  const priceOracle = await PriceOracle.deploy(initialAppId, initialOracle);
  
  await priceOracle.waitForDeployment();
  const contractAddress = await priceOracle.getAddress();
  
  console.log("PriceOracle deployed to:", contractAddress);
  
  // Set initial thresholds (example: $1500 - $3000 for ETH)
  const lowerBound = ethers.parseUnits("1500", 8); // $1500
  const upperBound = ethers.parseUnits("3000", 8); // $3000
  
  console.log("Setting initial thresholds...");
  const setThresholdsTx = await priceOracle.setThresholds(upperBound, lowerBound, true);
  await setThresholdsTx.wait();
  
  console.log("Thresholds set:");
  console.log("- Lower bound: $1500");
  console.log("- Upper bound: $3000");
  console.log("- Enabled: true");
  
  // Verify deployment
  const latestPrice = await priceOracle.getLatestPrice();
  const thresholds = await priceOracle.getThresholds();
  
  console.log("\nDeployment verification:");
  console.log("- Latest price:", ethers.formatUnits(latestPrice[0], 8));
  console.log("- Latest timestamp:", latestPrice[1].toString());
  console.log("- Threshold lower bound:", ethers.formatUnits(thresholds.lowerBound, 8));
  console.log("- Threshold upper bound:", ethers.formatUnits(thresholds.upperBound, 8));
  console.log("- Thresholds enabled:", thresholds.enabled);
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployerAddress,
    initialAppId: initialAppId,
    initialOracle: initialOracle,
    thresholds: {
      lowerBound: lowerBound.toString(),
      upperBound: upperBound.toString(),
      enabled: true
    },
    deploymentTime: new Date().toISOString(),
    transactionHash: priceOracle.deploymentTransaction().hash
  };
  
  console.log("\nDeployment completed successfully!");
  console.log("Save this information for your ROFL app configuration:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Instructions for next steps
  console.log("\n" + "=".repeat(60));
  console.log("NEXT STEPS:");
  console.log("=".repeat(60));
  console.log("1. Update your ROFL app .env file with:");
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`   ROFL_APP_ID=${initialAppId}`);
  console.log("");
  console.log("2. Update your frontend .env file with:");
  console.log(`   REACT_APP_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`   REACT_APP_CHAIN_ID=${await ethers.provider.getNetwork().then(n => n.chainId)}`);
  console.log("");
  console.log("3. Fund your oracle address with some ETH for gas fees");
  console.log("4. Start your ROFL app to begin price updates");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
