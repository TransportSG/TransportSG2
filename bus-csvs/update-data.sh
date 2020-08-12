DIRNAME=$(dirname "$0")

curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4Rt5p8Gq6HUWmtNkWkqYl0jkGxrEtCh9li2ibacMwLDJ0GpvinwnRayddrf8zJMXMuYH1zpPH_dPZ/pub?gid=819371872&single=true&output=csv" > $DIRNAME/data/SBS.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4Rt5p8Gq6HUWmtNkWkqYl0jkGxrEtCh9li2ibacMwLDJ0GpvinwnRayddrf8zJMXMuYH1zpPH_dPZ/pub?gid=2137214531&single=true&output=csv" > $DIRNAME/data/SMB.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4Rt5p8Gq6HUWmtNkWkqYl0jkGxrEtCh9li2ibacMwLDJ0GpvinwnRayddrf8zJMXMuYH1zpPH_dPZ/pub?gid=1503277849&single=true&output=csv" > $DIRNAME/data/SG.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4Rt5p8Gq6HUWmtNkWkqYl0jkGxrEtCh9li2ibacMwLDJ0GpvinwnRayddrf8zJMXMuYH1zpPH_dPZ/pub?gid=1534016276&single=true&output=csv" > $DIRNAME/data/TIB.csv
