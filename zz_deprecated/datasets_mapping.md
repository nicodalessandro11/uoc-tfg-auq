# 📍 Mapping of Geographic Datasets for the User-Facing GeoData App (Barcelona & Madrid)

This document summarizes the selected datasets from the open data portals of **Barcelona** and **Madrid**. Each row represents a relevant data source to display **points of interest** or **aggregated indicators** in the app. It includes a placeholder for linking the corresponding ETL script.

| Dataset | City | Category | Type | URL | File | ETL File |
|--------|--------|-----------|------|-----|------|----------|
| Equipamientos culturales de Barcelona | Barcelona | Culture | Point | [link](https://opendata-ajuntament.barcelona.cat/data/es/dataset/equipaments-culturals-icub) | `data/raw/Equipaments_del_mapa.csv` ✅ | `data/scripts/barcelona/load_point_feature.py` ✅ |
| Museos de Madrid | Madrid | Culture | Point | [link](https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=118f2fdbecc63410VgnVCM1000000b205a0aRCRD) | `...` | `...` |
| Equipamientos educativos de Barcelona | Barcelona | Education | Point | [link](https://opendata-ajuntament.barcelona.cat/data/es/dataset/equipament-educacio) | `...` | `...` |
| Centros educativos de Madrid | Madrid | Education | Point | [link](https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=f14878a6d4556810VgnVCM1000001d4a900aRCRD) | `...` | `...` |
| Bibliotecas Públicas de Madrid | Madrid | Education | Point | [link](https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=ed35401429b83410VgnVCM1000000b205a0aRCRD) | `...` | `...` |
| Hospitales y CAPs de Barcelona | Barcelona | Health | Point | [link](https://opendata-ajuntament.barcelona.cat/data/es/dataset/sanitat-hospitals-atencio-primaria) | `...` | `...` |
| Centros de atención médica de Madrid | Madrid | Health | Point | [link](https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=da7437ac37efb410VgnVCM2000000c205a0aRCRD) | `...` | `...` |
| Estaciones de autobús de Barcelona | Barcelona | Transport | Point | [link](https://opendata-ajuntament.barcelona.cat/data/es/dataset/estacions-bus) | `...` | `...` |
| Red transporte metropolitano de BCN | Barcelona | Transport | Point | [link](https://opendata-ajuntament.barcelona.cat/data/es/dataset/transports) | `...` | `...` |
| Paradas EMT de Madrid | Madrid | Transport | Point | [link](http://opendata.emtmadrid.es/) | `...` | `...` |
| Mercados municipales de Barcelona | Barcelona | Services | Point | [link](https://opendata-ajuntament.barcelona.cat/data/es/dataset/mercats-municipals) | `...` | `...` |
| Mercados municipales de Madrid | Madrid | Services | Point | [link](https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=b9f7530479243410VgnVCM1000000b205a0aRCRD) | `...` | `...` |
| Oficinas de Bienestar Social de BCN | Barcelona | Services | Point | [link](https://opendata-ajuntament.barcelona.cat/data/es/dataset/serveissocials-oficinesbenestarsocial) | `...` | `...` |
| Oficinas Línea Madrid (Atención Ciudadana) | Madrid | Services | Point | [link](https://datos.gob.es/es/catalogo/l01280796-oficinas-de-linea-madrid) | `...` | `...` |
| Población por barrio/distrito – BCN | Barcelona | Demography | Indicator | [link](https://opendata-ajuntament.barcelona.cat/data/es/dataset/pad_mdbas) | `...` | `...` |
| Población por barrio/distrito – Madrid | Madrid | Demography | Indicator | [link](https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=0cccaebc07c1f710VgnVCM2000001f4a900aRCRD) | `...` | `...` |
| Renta bruta media por hogar – BCN | Barcelona | Demography | Indicator | [link](https://opendata-ajuntament.barcelona.cat/data/es/dataset/atles-renda-bruta-per-llar) | `data/raw/2022_atles_renda_bruta_llar.csv` ✅ | `data/scripts/barcelona/load_indicators.py` ✅ |
| Parques y jardines de Barcelona | Barcelona | Urbanism | Point | [link](https://opendata-ajuntament.barcelona.cat/data/es/dataset/culturailleure-parcsjardins) | `...` | `...` |
| Parques y jardines destacados – Madrid | Madrid | Urbanism | Point | [link](https://datos.madrid.es/egob/catalogo/200761-0-parques-jardines.csv) | `...` | `...` |
| Superficie zonas verdes por distrito – Madrid | Madrid | Urbanism | Indicator | [link](https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=559b401daf436610VgnVCM1000001d4a900aRCRD) | `...` | `...` |

> ⚠️ All datasets listed are under open licenses (mostly CC BY 4.0 or similar) and are technically compatible with the existing database schema. ETL scripts will be updated as they are created.