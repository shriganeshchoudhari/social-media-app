#!/usr/bin/env bash
# run_all.sh — Run all 6 ConnectHub Postman collections via Newman
# Usage: ./run_all.sh [--env staging|local]
# Prereq: npm install -g newman newman-reporter-htmlextra

set -e

ENV_FILE="postman_environments/local.postman_environment.json"
BASE_URL="http://localhost:8080/api/v1"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_DIR="newman-results/${TIMESTAMP}"
FAILED=0

# Parse args
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --env)
      if [[ "$2" == "staging" ]]; then
        BASE_URL="${STAGING_URL:-http://staging.connecthub.io/api/v1}"
      fi
      shift ;;
  esac
  shift
done

mkdir -p "$REPORT_DIR"

echo "================================================"
echo "  ConnectHub Newman Test Runner"
echo "  BASE_URL: $BASE_URL"
echo "  Reports : $REPORT_DIR"
echo "================================================"

run_collection() {
  local num="$1"
  local file="$2"
  local label="$3"

  echo ""
  echo "▶  Running $num - $label ..."

  newman run "postman_collections/${file}" \
    -e "$ENV_FILE" \
    --env-var "BASE_URL=${BASE_URL}" \
    --reporters cli,junit,htmlextra \
    --reporter-junit-export "${REPORT_DIR}/${num}.xml" \
    --reporter-htmlextra-export "${REPORT_DIR}/${num}.html" \
    --delay-request 100 \
    --timeout-request 10000 || FAILED=$((FAILED + 1))
}

run_collection "01_auth"       "01_Auth.postman_collection.json"                    "Authentication"
run_collection "02_users"      "02_User_Management.postman_collection.json"         "User Management"
run_collection "03_posts"      "03_Posts_and_Feed.postman_collection.json"          "Posts & Feed"
run_collection "04_social"     "04_Social_Features.postman_collection.json"         "Social Features"
run_collection "05_messaging"  "05_Messaging_and_Notifications.postman_collection.json" "Messaging & Notifications"
run_collection "06_admin"      "06_Search_Media_Admin.postman_collection.json"      "Search, Media & Admin"

echo ""
echo "================================================"
if [[ $FAILED -eq 0 ]]; then
  echo "  ✅  All collections passed!"
else
  echo "  ❌  $FAILED collection(s) failed."
fi
echo "  Reports saved to: $REPORT_DIR"
echo "================================================"

exit $FAILED
