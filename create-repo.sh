#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up Git repository for Feedback Collection Platform${NC}"

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo -e "${RED}❌ Not in a git repository. Please run this from the project root.${NC}"
    exit 1
fi

# Check current remotes
if git remote | grep -q origin; then
    echo -e "${YELLOW}⚠️  Remote 'origin' already exists:${NC}"
    git remote -v
    echo -e "\n${YELLOW}Do you want to remove it and add a new one? (y/n):${NC}"
    read -r response
    if [[ "$response" == "y" || "$response" == "Y" ]]; then
        git remote remove origin
        echo -e "${GREEN}✅ Removed existing origin${NC}"
    else
        echo -e "${YELLOW}❌ Cancelled. Use 'git remote set-url origin <new-url>' to change URL${NC}"
        exit 1
    fi
fi

echo -e "\n${BLUE}Choose your Git hosting platform:${NC}"
echo "1) GitHub"
echo "2) GitLab"
echo "3) Bitbucket"
echo "4) Custom URL"
echo -e "\n${YELLOW}Enter your choice (1-4):${NC}"
read -r choice

case $choice in
    1)
        platform="GitHub"
        echo -e "\n${YELLOW}Enter your GitHub username:${NC}"
        read -r username
        echo -e "${YELLOW}Enter repository name (default: feedback-collection-platform):${NC}"
        read -r repo_name
        repo_name=${repo_name:-feedback-collection-platform}
        repo_url="https://github.com/$username/$repo_name.git"
        web_url="https://github.com/$username/$repo_name"
        ;;
    2)
        platform="GitLab"
        echo -e "\n${YELLOW}Enter your GitLab username:${NC}"
        read -r username
        echo -e "${YELLOW}Enter repository name (default: feedback-collection-platform):${NC}"
        read -r repo_name
        repo_name=${repo_name:-feedback-collection-platform}
        repo_url="https://gitlab.com/$username/$repo_name.git"
        web_url="https://gitlab.com/$username/$repo_name"
        ;;
    3)
        platform="Bitbucket"
        echo -e "\n${YELLOW}Enter your Bitbucket username:${NC}"
        read -r username
        echo -e "${YELLOW}Enter repository name (default: feedback-collection-platform):${NC}"
        read -r repo_name
        repo_name=${repo_name:-feedback-collection-platform}
        repo_url="https://$username@bitbucket.org/$username/$repo_name.git"
        web_url="https://bitbucket.org/$username/$repo_name"
        ;;
    4)
        platform="Custom"
        echo -e "\n${YELLOW}Enter the full repository URL:${NC}"
        read -r repo_url
        web_url=$repo_url
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "\n${BLUE}Setting up repository...${NC}"

# Add remote origin
git remote add origin "$repo_url"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to add remote origin${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Added remote origin: $repo_url${NC}"

# Rename branch to main
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    git branch -M main
    echo -e "${GREEN}✅ Renamed branch to 'main'${NC}"
fi

# Push to remote
echo -e "\n${BLUE}Pushing code to repository...${NC}"
git push -u origin main
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to push to remote repository${NC}"
    echo -e "${YELLOW}This might be because the repository doesn't exist yet.${NC}"
    echo -e "${YELLOW}Please create the repository on $platform first, then run:${NC}"
    echo -e "${BLUE}git push -u origin main${NC}"
    exit 1
fi

echo -e "\n${GREEN}🎉 Successfully pushed code to repository!${NC}"

# Add deployment guide to git
git add DEPLOYMENT_GUIDE.md create-repo.sh
git commit -m "Add deployment guide and repository setup script

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
git push

echo -e "\n${BLUE}📋 Next Steps:${NC}"
echo -e "1. ${YELLOW}Repository URL:${NC} $web_url"
echo -e "2. ${YELLOW}Clone elsewhere:${NC} git clone $repo_url"
echo -e "3. ${YELLOW}Set up deployment:${NC} See DEPLOYMENT_GUIDE.md"
echo -e "4. ${YELLOW}Configure environment:${NC} Update .env files for production"

if [ "$platform" == "GitHub" ]; then
    echo -e "\n${BLUE}🚀 Quick Deploy Options:${NC}"
    echo -e "• ${YELLOW}Frontend (Vercel):${NC} Connect your GitHub repo at vercel.com"
    echo -e "• ${YELLOW}Backend (Railway):${NC} Connect your GitHub repo at railway.app"
    echo -e "• ${YELLOW}Database:${NC} Set up MongoDB Atlas at mongodb.com/atlas"
fi

echo -e "\n${GREEN}✨ Your Feedback Collection Platform is now on $platform!${NC}"