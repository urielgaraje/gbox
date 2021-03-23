# Gbox
## _Shipping of boxes, demo for PWA_


## Cacheo

**Necesario para que nuestra app funcione de manera offline**

A la hora de realizar ***caching*** podemos adoptar varias ***estategias***..

Estrategia | Caso de uso
---------- | -------------
Cache only | Nuestro contenido permance estatico y raramente cambia. En este caso no se recurre a la red.
Cache first, falling back to network | El contenido no es critico y puede ser servido del cache rapidamente, el SW ocasionalmente debe recurrir a la red.
Network first, falling back to cache | Cuando la frecuencia del cambio de contenido es baja, es decir que si nos quedamos sin conexión no es crítico devolver la ultima versión de la petición.
Stale while revalidate | Se prioriza el cache primero y luego se actualiza la petición desde la red si es posible. Lo utilizamos en páginas donde tiene que haber una respuesta inmediata. La mayoría del tiempo estaremos un paso atrás en contenido.
Network only | Es crítico que el contenido a obtener sea el último. Normalmente se utiliza en el consumo de APIs. Siempre recurrimos a la red, esta estrategia debe usarse en conjunto con otras.