# Aplicación hibrida en Ionic Framework (Angular)
Aplicación hibirida en Ionic Framework que sirve como frontend para la capacitacióny monitoreo de movimientos de choferes en CyM.

Para ejecutar y probar la aplicación de manera local, es necesario contar con los siguientes programas instalados:
- Node js: es importante instalar este programa para el correcto funcionamiento de Ionic Framework, enlace de descarga: https://nodejs.org/es/
- Git: es necesario para clonar el proyecto y descargarlo de forma local en el equipo. Link de descarga: https://git-scm.com/downloads
- Un editor de código, por ejemplo, Visual Studio Code: https://code.visualstudio.com/ (es recomendable instalar extensiones para PHP en VS Code para tener una mejor experencia al desarrollar).

Procedimiento
- Abrir la terminal y verificar si Node js esta instalado usando el comenado: node --version, si devulve la respuesta, proceder a instalar el CLI de Ionic con el comando: npm i -g @ionic/cli. Esto permitira crear proyectos de Ionic.
- Abrir la terminal y dirigirse a la carpeta de su preferencia, puede ser el escritorio o documentos, etc. En esta carpeta de clonara el proyecto desde el repositorio de GitHub usando el comando: git clone https://github.com/lokiiiv/cym_choferes_ionic_app.git, de descargara el proyecto en la carpeta correspondiente.
- Ubicar la carpeta donde se descargo el proyecto y eliminar la carpeta llamada "node_modules" si es que se encuentra.
- Estando en la terminal, dirigirse a la carpeta del proyecto y ejecutar el comando "npm cache clean --force" (sin las comillas).
- Estando en la terminal, dirigirse a la carpeta del proyecto y ejecutar el comando "npm install" (sin las comillas), esto empezar a descargar todas las dependencias o plugins faltantes al proyecto (En este punto asegurese de tener buena conexión a internet, si falla intente ejecutar el comando nuevamente).

Aspectos importantes:
- Antes de ejecutar la aplicación, hay que tomar en cuenta que se conecta a la API de Laravel, por lo que es importante tener la aplicación Laravel ejecutandose y conocer la dirección IP del servidor, ya que es necesario incluir esa dirección IP en el archivo de enviroment de Ionic el cual se encuentra en la carpeta src/enviroments/enviroment.ts, en ese archivo hay una variable llamada "api_url", cambiar la dirección IP por la direccion correcta, ejemplo: 'http://192.168.0.9:8000/api'. Esto se hace con la finalidad de definir la dirección principal de la API Laravel a la cual Ionic debe conectarse, ya que los servicios de Angular toman esta variable para hacer peticiones a la API.

Ejecutar la aplicación:
- En la terminal, estando en la carpeta del proyecto, ejecutar el comando "ionic serve" (sin comillas), esto comenzara la ejecución de la aplicación en el navegador, puede usar el navegador para cambiar el tamaño de la pagina a uno de un dispositivo movil o ver que peticiones hace la app al servidor.
- Puede ejecutar la aplicación en un dispositivo Android usando en comando "ionic capacitor run android", esto mostrara una lista de emuladores o dispositivos fisicos conectados a la PC (activar depuración usb en el modo desarrollador si se usa un movil fisico). Más adelante se muestra material que indica como ejecutar la app y generar una APK con ayuda de Android Studio.
- La ejecución para iOS no esta probada al 100% esto debido a que algunos plugin o librerías requieren configuraciones especificas para iOS, además de que se necesita XCode para hacer esto y una MAC para probar las aplicaciones en dispositivos iOS.

Si al ejecutar ionic serve muestra errores, eliminar la carpeta node_modules, ejecutar el comando "npm cache clean --force" y finalmente ejecutar "npm install".

En el siguiente video se muestra un apoyo para entender como ejecutar una app Ionic en Android Studio: [https://www.youtube.com/watch?v=EdZ0hQtrfEU](https://www.youtube.com/watch?v=JuYZ2xdHw3o)

Material de apoyo para entender Ionic y Angular un poco (me ayudo mucho xd): https://www.youtube.com/watch?v=i-oYrcNtc2s, https://www.youtube.com/watch?v=akCCJrG9-Dk&t=2176s, https://www.youtube.com/watch?v=bJ_DALcR1Ts, https://youtube.com/playlist?list=PLsngLoGbAagFEG-jwlpPhGsLzMSQ0tadP.
Basicamente entendiendo Angular se entiende Ionic de manera fácil.
