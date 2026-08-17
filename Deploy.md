``` sh
### Helm chart
# Dry run
helm template daffigard ./daffigard-chart

# Deploy / Upgrade
helm upgrade --install daffigard ./daffigard-chart
# Uninstall / Delete
helm uninstall daffigard
```