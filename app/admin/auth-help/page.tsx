import Link from "next/link"

export default function AuthHelpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Link
        href="/"
        className="absolute top-4 left-4 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-200 focus:outline-none"
        title="Ir al inicio"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </Link>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
            EW
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center">Solución de problemas de autenticación</h1>

        <div className="space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Si estás experimentando problemas con los enlaces de autenticación, sigue las instrucciones a
                  continuación.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold">Error "localhost currently unreachable"</h2>
          <p className="text-gray-700">
            Este error ocurre cuando los enlaces de autenticación están configurados para redirigir a localhost en lugar
            de a la URL de tu aplicación desplegada.
          </p>

          <h3 className="text-lg font-medium mt-4">Solución:</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>
              <strong>Actualiza la variable de entorno:</strong> Asegúrate de que la variable de entorno{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_APP_URL</code> esté configurada con la URL
              correcta de tu aplicación desplegada.
            </li>
            <li>
              <strong>Modifica manualmente el enlace:</strong> Si recibiste un enlace por correo electrónico que
              contiene "localhost", puedes modificarlo manualmente:
              <ul className="list-disc pl-5 mt-2">
                <li>
                  Reemplaza <code className="bg-gray-100 px-1 py-0.5 rounded">http://localhost:3000</code> con la URL de
                  tu aplicación desplegada.
                </li>
                <li>
                  Por ejemplo, cambia{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">
                    http://localhost:3000/admin/reset-password#access_token=...
                  </code>{" "}
                  a{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">
                    https://tu-dominio.com/admin/reset-password#access_token=...
                  </code>
                </li>
              </ul>
            </li>
            <li>
              <strong>Solicita un nuevo enlace:</strong> Si la modificación manual no funciona, solicita un nuevo enlace
              de recuperación después de que el administrador haya configurado correctamente la variable de entorno.
            </li>
          </ol>

          <h2 className="text-xl font-semibold mt-8">No recibo correos electrónicos</h2>
          <p className="text-gray-700">
            Si no recibes los correos electrónicos de confirmación o recuperación de contraseña, prueba estas
            soluciones:
          </p>

          <h3 className="text-lg font-medium mt-4">Verificaciones básicas:</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>
              <strong>Revisa tu carpeta de spam/correo no deseado</strong>: Los correos de autenticación a veces son
              filtrados como spam.
            </li>
            <li>
              <strong>Verifica la dirección de correo</strong>: Asegúrate de que la dirección de correo electrónico que
              ingresaste es correcta y coincide con la que usaste para registrarte.
            </li>
            <li>
              <strong>Espera unos minutos</strong>: A veces los correos pueden tardar en llegar, especialmente si el
              servidor de correo está ocupado.
            </li>
          </ol>

          <h3 className="text-lg font-medium mt-4">Soluciones alternativas:</h3>
          <p className="text-gray-700">
            Si sigues sin recibir correos, tenemos opciones de emergencia para administradores:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Link
              href="/admin/reset-admin"
              className="bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-md"
            >
              Restablecer contraseña de administrador
            </Link>
            <Link
              href="/admin/create-admin"
              className="bg-purple-600 hover:bg-purple-700 text-white text-center py-3 px-4 rounded-md"
            >
              Crear nuevo administrador
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Nota: Estas opciones requieren una clave de administración especial. Contacta al desarrollador del sistema
            para obtenerla.
          </p>

          <h3 className="text-lg font-medium mt-4">Para administradores:</h3>
          <p className="text-gray-700">Para configurar correctamente el envío de correos:</p>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>
              Verifica la configuración de SMTP en Supabase (si estás usando un proveedor de correo personalizado).
            </li>
            <li>Asegúrate de que el dominio de correo electrónico no esté bloqueado o en listas negras de spam.</li>
            <li>
              Considera usar un servicio de correo electrónico transaccional como SendGrid, Mailgun o Amazon SES para
              mejorar la entrega.
            </li>
          </ol>

          <div className="flex justify-center mt-6 space-x-4">
            <Link
              href="/admin/login"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Volver al inicio de sesión
            </Link>
            <Link
              href="/admin/forgot-password"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
            >
              Recuperar contraseña
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
