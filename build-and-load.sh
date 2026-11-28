#!/bin/bash
set -e

echo "=== ScholarX — Build & Load into Minikube ==="
echo ""

# Point Docker to Minikube's daemon so images are available inside the cluster
echo ">>> Pointing Docker to Minikube daemon..."
eval $(minikube docker-env)

SERVICES=("scholar-service" "ai-review-service" "gap-service" "notification-service")

for svc in "${SERVICES[@]}"; do
  echo ""
  echo ">>> Building scholarx/$svc:1.0.0 ..."
  docker build -t "scholarx/$svc:1.0.0" "./$svc"
  echo "✅ $svc built"
done

echo ""
echo "=== All images built inside Minikube ==="
docker images | grep "scholarx/"
echo ""
echo ">>> Ready to deploy:"
echo "    kubectl apply -f k8s/"
