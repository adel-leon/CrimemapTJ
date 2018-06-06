CrimemapTJ
==========

CrimemapTJ es un mapa que permite visualizar el crimen en el municipio de Tijuana, B.C. Actualmente los datos mostrados corresponden al periodo aproximado del 25 de Diciembre de 2017 al 31 de Marzo de 2018. Los crimenes están distribuidos aleatoriamente en un rango sobre la ciudad de Tijuana por el fallo de la Secretaría de Seguridad Pública de proporcionar las coordenadas de los crímenes.

Tecnologías usadas:
-------------------
    mLab - Proveedor de base de datos
    MongoDB - Sistema de base de datos
    Mongoose - Modelado de objetos
    Node - Entorno de servidor
    Express - Node web framework
    Mapbox GL JS - Biblioteca para renderización de mapas
    Git - Control de versiones
    Github - Alojamiento de proyecto

Instrucciones para acceder:
---------------------------
    Es necesario internet para la visualización del mapa y el acceso a la base de datos.
    1.- Ejecutar "npm install" en la carpeta raíz del proyecto.
    2.- Ejecutar un servidor de Node en la carpeta raíz del proyecto.
    3.- Acceder a "localhost:3000" en el explorador.
    3.1.- En caso de querer acceder a los datos que se solicitan al servidor, agregar "/API/crimes" al URL.