docker build --no-cache -t homarr-beta:latest https://github.com/Bergasha/homarr.git#beta

docker stop homarr-beta && docker rm homarr-beta

docker run -d \
  --name=homarr-beta \
  --restart unless-stopped \
  -p 7578:7575 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /shayno/shocker/homarr-beta/appdata:/appdata \
  -e SECRET_ENCRYPTION_KEY=c9d0708e0bae0c123256d99949dd111993f00bbd6653c41e4d9e797dbcf9bf48 \
  -e NODE_OPTIONS=--network-family-autoselection-attempt-timeout=500 \
  -e WORKSHOP_API_URL="https://v2.preview.homarr.dev" \
  -e WORKSHOP_WEB_URL="https://v2.preview.homarr.dev/workshop" \
  --network mediastack \
  homarr-beta:latest
