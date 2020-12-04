# Tuerti

_Recreación basada en nodejs de Tuenti, red social española popular en la década de 2010 y convertida ahora en operadora telefónica_

### Pre-requisitos 📋

* [NodeJs](https://nodejs.org/es/)

* Base de datos relacional

### Instalación 🔧

_Instalar las dependencias npm_

_Abre un terminal y accede al directorio donde se encuentre app.js, una vez dentro escribe el siguiente comando:_

```
npm install
```

_Esto creara una carpeta node_modules donde estarán todas las dependencias necesarias para que todo funcione en orden_

_Crea un archivo .env y escribe las variables necesarias para iniciar la web y acceder a la base de datos, las variables necesarias son las siguientes:_

```
URL=LA_IP_A_UTILIZAR

PORT=PUERTO_A_UTILIZAR

PASSPORT_SECRET=CÓDIGO_SECRETO_CUALQUIERA

NODE_ENV='development' o 'test o 'production'

DB_NAME="NOMBRE_DE_LA_BBDD"

DB_USER="USUARIO_CON_ACCESO_A_LA_BBDD"

DB_PASS="CONTRASEÑA_DEL_USUARIO"

DB_HOST="IP_DONDE_ESTÉ_ALOJADA_LA_BBDD"

DB_PORT="PUERTO_QUE_UTILIZA_LA_BBDD"
```

## Iniciar la web ⚙️

_Una vez preparado todo lo anterior puedes iniciar la web entrando con un terminal al directorio donde se encuentra app.js y escribiendo el siguiente comando:_

```
node app.js
```

_Te aparecerá en la consola la ip y el puerto donde se está alojando la web y solo tendrás que entrar en el navegador y copiar ip:puerto en la barra de direcciones para acceder._

## Construido con 🛠️

* [Bootstrap](https://getbootstrap.com) - El framework web usado
* [Villanuevand](https://gist.github.com/Villanuevand/6386899f70346d4580c723232524d35a#file-readme-espanol-md) - Modelo de README.md

## Autor ✒️

* **alexay7** - *Desarrollo* - [alexay7](https://github.com/alexay7)

## Licencia 📄

Este proyecto está bajo la Licencia (GNU General Public License v3.0) - mira el archivo [LICENSE.md](LICENSE.md) para detalles
