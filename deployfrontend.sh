rsync -r src/ docs/
rsync build/contracts/* docs/
git add .
git commit -m "Compile assets for Github webpage"
git push -f origin master