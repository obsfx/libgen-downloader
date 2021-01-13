lurkdown --files=README.md \
  --styles='font.css,new.min.css,night.css' \
  --titles='libgen-downloader'

mv README.html index.html

git add -A
git commit -m "index"
git push -u origin gh-pages
