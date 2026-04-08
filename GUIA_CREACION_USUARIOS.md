# Guía para la Creación de Usuarios Manuales (Base de Datos)

En el nuevo sistema de seguridad empresarial (RBAC) de MyCard, las contraseñas ya no se guardan de forma descifrada por seguridad. Sigue estos pasos para dar de alta nuevos usuarios desde tu panel de phpMyAdmin.

## 🔒 1. Encriptar la Contraseña
Para evitar que hackers o administradores de base de datos vean las contraseñas reales, estas deben ser convertidas en un Hash (Bcrypt).
1. Entra a una página gratuita de encriptación como: [Bcrypt Generator](https://bcrypt-generator.com/).
2. Escribe la contraseña que quieres darle al usuario y presiona **"Encrypt"** o **"Hash"**.
3. Copia el texto resultante, será una cadena de unos 60 caracteres (generalmente empezando con `$2y$10$...`).

## ⚙️ 2. Crear el Usuario (phpMyAdmin)
1. Entra a **phpMyAdmin**, selecciona la base de datos `inventario_mycard`.
2. Haz clic sobre la tabla **`usuarios`**.
3. Selecciona la pestaña superior llamada **"Insertar"** *(Insert)*.
4. Llena exactamente los siguientes incisos:

*   **`nombre_completo`**: El nombre real del empleado (Ej. *Pedro Ramírez*).
*   **`username`**: Su identificador para iniciar sesión (Ej. *p.ramirez*).
*   **`password_hash`**: **PEGA** el larguísimo código que copiaste en el Paso 1. (No tu contraseña corta).
*   **`rol_id`**: Escribe el número del Rol que deseas otorgarle. Guíate en la siguiente tabla:
    *   **`1`** = Administrador *(Poder absoluto de modificación de equipos y consulta de datos).*
    *   **`2`** = Técnico *(Nivel operativo. Permite editar y modificar todo el hardware del inventario).*
    *   **`3`** = Consulta *(Usuario común. Sólo lectura. Todos los botones de editar desaparecerán).*
    *   **`4`** = Auditor / Supervisor *(Sólo lectura y consulta extra de Bitácoras secretas de Auditoría).*
*   **`estatus`**: Escribe **`1`** (Significa activo. Si en un futuro quieres revocar su acceso, cámbialo a `0`).

## 💾 3. Confirmar 
*   Baja y presiona **"Continuar"** (Save).
*   Pídele al usuario que intente loguearse en el sistema. Magicamente los botones y opciones estarán adaptados al "Rol" que le otorgaste.
