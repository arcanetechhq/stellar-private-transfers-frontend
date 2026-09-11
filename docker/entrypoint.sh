#!/bin/sh
set -eu

ROOT="${NGINX_HTML_ROOT:-/usr/share/nginx/html}"

substitute() {
  key="$1"
  value="$2"
  token="__STAND_${key}__"
  if [ -z "$value" ]; then
    return 0
  fi
  find "$ROOT" -type f \( -name '*.js' -o -name '*.html' -o -name '*.css' \) -print |
    while IFS= read -r file; do
      sed -i "s|${token}|${value}|g" "$file"
    done
}

if [ -n "${VITE_PAYMENT_API_BASE_URL:-}" ]; then
  substitute VITE_API_BASE_URL "$VITE_PAYMENT_API_BASE_URL"
fi
substitute VITE_API_BASE_URL "${VITE_API_BASE_URL:-}"
substitute VITE_STELLAR_NETWORK_PASSPHRASE "${VITE_STELLAR_NETWORK_PASSPHRASE:-}"
substitute VITE_HORIZON_URL "${VITE_HORIZON_URL:-}"
substitute VITE_SOROBAN_RPC_URL "${VITE_SOROBAN_RPC_URL:-}"
substitute VITE_POOL_CONTRACT "${VITE_POOL_CONTRACT:-}"
substitute VITE_PRIVATE_ADDRESS_REGISTRY_CONTRACT "${VITE_PRIVATE_ADDRESS_REGISTRY_CONTRACT:-}"
substitute VITE_KYT_PASSAGE_REGISTRY_CONTRACT "${VITE_KYT_PASSAGE_REGISTRY_CONTRACT:-}"
substitute VITE_APPLICATION_ID "${VITE_APPLICATION_ID:-}"
substitute VITE_STELLAR_AUDIT_PUBLIC_KEY "${VITE_STELLAR_AUDIT_PUBLIC_KEY:-}"
substitute VITE_PRICE_XLM "${VITE_PRICE_XLM:-}"
substitute VITE_ZK_CONFIG_NONCE "${VITE_ZK_CONFIG_NONCE:-}"
substitute VITE_ZK_ARTIFACT_BASE_URL "${VITE_ZK_ARTIFACT_BASE_URL:-}"
substitute VITE_RELAY_API_ORIGIN "${VITE_RELAY_API_ORIGIN:-}"

# Runtime substitution changes hashed JS/CSS bytes without renaming them.
# Query-bust index.html so browsers do not keep the pre-substitution immutable cache.
stamp="$(date +%s)"
find "$ROOT" -name 'index.html' -print |
  while IFS= read -r file; do
    sed -i "s|\\(assets/[^\"']*\\.js\\)|\\1?v=${stamp}|g" "$file"
    sed -i "s|\\(assets/[^\"']*\\.css\\)|\\1?v=${stamp}|g" "$file"
  done

exec nginx -g 'daemon off;'
