DIRNAME=$(dirname "$0")

curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4Rt5p8Gq6HUWmtNkWkqYl0jkGxrEtCh9li2ibacMwLDJ0GpvinwnRayddrf8zJMXMuYH1zpPH_dPZ/pub?gid=819371872&single=true&output=csv" > $DIRNAME/data/SBS.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4Rt5p8Gq6HUWmtNkWkqYl0jkGxrEtCh9li2ibacMwLDJ0GpvinwnRayddrf8zJMXMuYH1zpPH_dPZ/pub?gid=2137214531&single=true&output=csv" > $DIRNAME/data/SMB.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4Rt5p8Gq6HUWmtNkWkqYl0jkGxrEtCh9li2ibacMwLDJ0GpvinwnRayddrf8zJMXMuYH1zpPH_dPZ/pub?gid=1503277849&single=true&output=csv" > $DIRNAME/data/SG.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4Rt5p8Gq6HUWmtNkWkqYl0jkGxrEtCh9li2ibacMwLDJ0GpvinwnRayddrf8zJMXMuYH1zpPH_dPZ/pub?gid=1534016276&single=true&output=csv" > $DIRNAME/data/TIB.csv

curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=1276928138&single=true&output=csv" > $DIRNAME/data/PA.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=1216385463&single=true&output=csv" > $DIRNAME/data/PC.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=1415588182&single=true&output=csv" > $DIRNAME/data/CB.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=1118081745&single=true&output=csv" > $DIRNAME/data/PD.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=1885202379&single=true&output=csv" > $DIRNAME/data/PH.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=1531514622&single=true&output=csv" > $DIRNAME/data/PZ.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=199506525&single=true&output=csv" > $DIRNAME/data/SH.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=1649578794&single=true&output=csv" > $DIRNAME/data/RU.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=901630868&single=true&output=csv" > $DIRNAME/data/RD.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=167450199&single=true&output=csv" > $DIRNAME/data/WB.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=658385261&single=true&output=csv" > $DIRNAME/data/WC.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=1918182098&single=true&output=csv" > $DIRNAME/data/YN.csv
curl -L "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=760284212&single=true&output=csv" > $DIRNAME/data/XD.csv
