# Boxing Strength Tracker

PWA móvil para seguir las 3 sesiones de fuerza que complementan tus 5 días de boxeo.

## V2 incluye
- Rutinas A/B/C precargadas.
- Peso, repeticiones, RIR y series completadas.
- Carga de la sesión anterior precargada.
- Recomendación automática de progresión (+2,5 kg o repetir carga).
- Temporizador de descanso según el ejercicio y +15 s.
- Fichas rápidas de técnica de cada ejercicio.
- RPE de pesas y sensación del boxeo posterior.
- Dashboard con sesiones, volumen, ejercicios registrados y sensación media de boxeo.
- Gráfica de 1RM estimado por ejercicio.
- Mejores marcas por ejercicio.
- Historial con volumen y eliminación individual.
- Exportación e importación JSON.
- Perfil y objetivo.
- PWA instalable y funcionamiento offline tras la primera carga.
- Sin backend: los entrenamientos permanecen en localStorage del dispositivo.

## Progresión
Para los básicos se recomienda mantener RIR 2. Cuando completes el extremo alto del rango con buena técnica, la app propone probar +2,5 kg. La potencia no se progresa acumulando repeticiones: si baja claramente la velocidad, termina la serie.

## Privacidad
El repositorio contiene el código de la aplicación, pero tus entrenamientos **no se escriben en GitHub**. Se almacenan localmente en el navegador/dispositivo. Usa Exportar JSON para crear una copia de seguridad.

## GitHub Pages
El repositorio incluye un workflow de GitHub Actions para desplegar la raíz como GitHub Pages:
https://molina98tel.github.io/boxing-strength-tracker/

Si Pages no estuviera activo, ve a Settings → Pages y selecciona GitHub Actions como fuente.
