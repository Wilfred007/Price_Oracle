# Contributing to Verifiable Price Oracle

Thank you for your interest in contributing to the Verifiable Price Oracle project! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Basic understanding of:
  - Solidity and smart contracts
  - React and JavaScript
  - Trusted Execution Environments (TEE)
  - Oasis Network and ROFL

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/Price_oracle.git`
3. Run the setup script: `./scripts/setup.sh`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## 📋 Development Guidelines

### Code Style
- Use ESLint and Prettier for JavaScript/TypeScript
- Follow Solidity style guide for smart contracts
- Use meaningful variable and function names
- Add comments for complex logic

### Commit Messages
Follow the conventional commits specification:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(oracle): add multi-asset price support
fix(frontend): resolve wallet connection issue
docs(readme): update deployment instructions
```

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

## 🧪 Testing

### Running Tests
```bash
# Run all tests
./scripts/test.sh

# Run specific test suites
npm test                    # In contracts/
npm test                    # In rofl-app/
npm test                    # In frontend/
```

### Test Requirements
- All new features must include tests
- Maintain or improve test coverage
- Tests should be deterministic and fast
- Use descriptive test names

### Test Categories
1. **Unit Tests**: Test individual functions/components
2. **Integration Tests**: Test component interactions
3. **Contract Tests**: Test smart contract functionality
4. **Security Tests**: Test for vulnerabilities
5. **Performance Tests**: Test gas usage and response times

## 🔒 Security

### Security Guidelines
- Never commit private keys or sensitive data
- Use environment variables for configuration
- Follow smart contract security best practices
- Report security vulnerabilities privately

### Security Review Process
1. All smart contract changes require security review
2. Use static analysis tools (Slither, MythX)
3. Consider formal verification for critical functions
4. Test on testnets before mainnet deployment

## 📝 Documentation

### Documentation Requirements
- Update README.md for significant changes
- Add inline code comments
- Update API documentation
- Include deployment instructions

### Documentation Style
- Use clear, concise language
- Include code examples
- Add diagrams for complex flows
- Keep documentation up-to-date

## 🐛 Bug Reports

### Before Reporting
1. Check existing issues
2. Test on the latest version
3. Reproduce the bug consistently

### Bug Report Template
```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- OS: [e.g., Ubuntu 20.04]
- Node.js version: [e.g., 18.17.0]
- Browser: [e.g., Chrome 115]

**Additional Context**
Any other relevant information.
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Feature Description**
A clear description of the proposed feature.

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other approaches you've considered.

**Additional Context**
Any other relevant information.
```

## 🔄 Pull Request Process

### Before Submitting
1. Ensure all tests pass
2. Update documentation
3. Follow code style guidelines
4. Rebase on the latest main branch

### Pull Request Template
```markdown
**Description**
Brief description of changes.

**Type of Change**
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

**Testing**
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

**Checklist**
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process
1. Automated checks must pass
2. At least one maintainer review required
3. Address all review comments
4. Squash commits before merging

## 🏗️ Architecture Decisions

### Adding New Features
1. Discuss in GitHub issues first
2. Consider backward compatibility
3. Update architecture documentation
4. Plan migration strategy if needed

### Smart Contract Changes
1. Consider gas optimization
2. Maintain upgrade compatibility
3. Add comprehensive tests
4. Document state changes

### Frontend Changes
1. Maintain responsive design
2. Consider accessibility
3. Test across browsers
4. Optimize performance

## 📞 Communication

### Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat (if available)

### Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow project guidelines

## 🎯 Contribution Areas

### High Priority
- Security improvements
- Performance optimizations
- Test coverage improvements
- Documentation updates

### Medium Priority
- New oracle features
- UI/UX improvements
- Integration examples
- Monitoring tools

### Good First Issues
Look for issues labeled `good-first-issue`:
- Documentation fixes
- Simple bug fixes
- Test additions
- Code cleanup

## 🏆 Recognition

### Contributors
All contributors will be:
- Listed in the README
- Mentioned in release notes
- Invited to contributor events

### Maintainers
Active contributors may be invited to become maintainers with:
- Commit access
- Review responsibilities
- Decision-making participation

## 📚 Resources

### Learning Materials
- [Oasis Network Documentation](https://docs.oasis.io/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [React Documentation](https://react.dev/)
- [TEE Fundamentals](https://en.wikipedia.org/wiki/Trusted_execution_environment)

### Development Tools
- [Hardhat](https://hardhat.org/) - Smart contract development
- [MetaMask](https://metamask.io/) - Wallet integration
- [Remix](https://remix.ethereum.org/) - Online Solidity IDE

## ❓ Questions?

If you have questions about contributing:
1. Check existing documentation
2. Search GitHub issues
3. Ask in GitHub Discussions
4. Contact maintainers

Thank you for contributing to the Verifiable Price Oracle! 🙏
