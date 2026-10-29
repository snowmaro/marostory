#!/bin/sh
# 포트폴리오 에셋을 사이트용 webp로 변환한다.
# 사용: sh .site-tools/site-assets.sh ~/dev/portpolio/build/assets
set -e
SRC="$1"; OUT="$(cd "$(dirname "$0")/.." && pwd)/assets/site/img"
mkdir -p "$OUT"
icon() { cwebp -quiet -q 90 "$SRC/icons/$1.png" -o "$OUT/icon-$2.webp"; }
shot() { cwebp -quiet -q 82 -resize 600 0 "$SRC/$1" -o "$OUT/$2.webp"; }
icon pikmade pikmade; icon sainote sainote; icon leftty leftty; icon routiney routiney; icon hairory hairory
icon connecting-line pipelody; icon archery archery; icon edge-runner binglerun; icon postcard-metro postcardmetro; icon lifts ticktownlifts
shot sainote/home.jpg sainote-1; shot sainote/people.jpg sainote-2; shot sainote/insights.jpg sainote-3
shot leftty/01-home.jpg leftty-1; shot leftty/02-count-detail.jpg leftty-2; shot leftty/05-reminders.jpg leftty-3
shot routiney/01-home.jpg routiney-1; shot routiney/02-detail-morning.jpg routiney-2; shot routiney/03-edit-interval.jpg routiney-3
shot hairory/01-home.jpg hairory-1; shot hairory/02-detail.jpg hairory-2; shot hairory/03-search.jpg hairory-3; shot hairory/04-new-record.jpg hairory-4
for g in pipelody archery metro:postcardmetro bingle:binglerun lifts:ticktownlifts; do
  src="${g%%:*}"; dst="${g##*:}"; shot "games/$src-1.jpg" "$dst-1"
done
echo "done: $OUT"
