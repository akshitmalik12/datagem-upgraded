#!/bin/bash
echo "Installing Redis..."
brew install redis
brew services start redis

echo "Installing Python dependencies..."
/opt/miniconda3/bin/pip install chromadb celery presidio-analyzer presidio-anonymizer playwright

echo "Installing Playwright browsers..."
/opt/miniconda3/bin/playwright install
