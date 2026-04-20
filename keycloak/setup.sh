#!/bin/bash
set -e

echo "==> Esperando que Keycloak este listo..."
until /opt/keycloak/bin/kcadm.sh config credentials \
  --server "$KEYCLOAK_URL" \
  --realm master \
  --user "$KEYCLOAK_ADMIN" \
  --password "$KEYCLOAK_ADMIN_PASSWORD" 2>/dev/null; do
  echo "    Reintentando en 5s..."
  sleep 5
done
echo "==> Keycloak listo."

echo "==> Creando realm poc-realm..."
/opt/keycloak/bin/kcadm.sh create realms \
  -s realm=poc-realm \
  -s enabled=true \
  2>/dev/null && echo "    Realm creado." || echo "    Ya existe."

echo "==> Desactivando default required actions del realm..."
for ACTION in VERIFY_EMAIL UPDATE_PASSWORD CONFIGURE_TOTP UPDATE_PROFILE; do
  /opt/keycloak/bin/kcadm.sh update authentication/required-actions/$ACTION \
    -r poc-realm -s defaultAction=false 2>/dev/null && echo "    $ACTION desactivado." || echo "    $ACTION no encontrado, ok."
done

echo "==> Creando cliente poc-client..."
/opt/keycloak/bin/kcadm.sh create clients -r poc-realm \
  -s clientId=poc-client \
  -s enabled=true \
  -s publicClient=true \
  -s directAccessGrantsEnabled=true \
  -s standardFlowEnabled=false \
  -s 'redirectUris=["http://localhost:4200/*"]' \
  -s 'webOrigins=["http://localhost:4200"]' \
  2>/dev/null && echo "    Cliente creado." || echo "    Ya existe."

echo "==> Creando usuario dev..."
/opt/keycloak/bin/kcadm.sh create users -r poc-realm \
  -s username=dev \
  -s firstName=Dev \
  -s lastName=User \
  -s email=dev@poc.local \
  -s enabled=true \
  -s emailVerified=true \
  -s 'requiredActions=[]' \
  2>/dev/null && echo "    Usuario creado." || echo "    Ya existe."

echo "==> Obteniendo ID del usuario..."
USER_ID=$(/opt/keycloak/bin/kcadm.sh get users -r poc-realm -q username=dev 2>/dev/null \
  | grep '"id"' | head -1 | sed 's/.*"id" : "\([^"]*\)".*/\1/')
echo "    USER_ID='$USER_ID'"

if [ -z "$USER_ID" ]; then
  echo "ERROR: No se pudo obtener el USER_ID. Abortando."
  exit 1
fi

echo "==> Seteando password dev123..."
/opt/keycloak/bin/kcadm.sh set-password -r poc-realm \
  --username dev \
  --new-password dev123
echo "    Password seteado."

echo "==> Limpiando required actions del usuario..."
/opt/keycloak/bin/kcadm.sh update users/$USER_ID -r poc-realm -s 'requiredActions=[]'
echo "    Required actions limpiados."

echo "==> Verificando estado final del usuario..."
/opt/keycloak/bin/kcadm.sh get users/$USER_ID -r poc-realm \
  --fields username,enabled,emailVerified,requiredActions

echo "==> Setup completo!"
