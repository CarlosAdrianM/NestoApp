<#
    Ritual al promocionar NestoApp a Production (Carlos, 30/09/26): después de promocionar en AppFlow y
    ejecutar scripts/Novedades_<version>.sql, manda una push a los móviles con NestoApp diciendo cómo
    estrenar la versión nueva. Queda también en su buzón de avisos. Al tocarla se abre el perfil (novedades).

    Por qué dos cierres: Live Updates está en modo «background» (capacitor.config.ts). Descarga la versión al
    arrancar la app EN FRÍO y la estrena en el SIGUIENTE arranque en frío; volver desde segundo plano no cuenta.

    PROVISIONAL hasta NestoAPI#579 (POST api/Notificaciones/NuevaVersionNestoApp, que mandará a todos los
    dispositivos de una vez). Mientras tanto se llama a POST api/Notificaciones/Enviar una vez por usuario, así
    que hay que pasarle los usuarios: los que tienen dispositivo activo de NestoApp en la base de datos:
      SELECT DISTINCT Usuario FROM dbo.DispositivosNotificaciones WHERE Aplicacion = 'NestoApp' AND Activo = 1

    Uso (desde Windows, con el usuario de alguien de Dirección o Informática):
      .\AvisarNuevaVersionNestoApp.ps1 -Version 2.22.0 -Prueba                       # solo a Carlos
      .\AvisarNuevaVersionNestoApp.ps1 -Version 2.22.0 -Usuarios Marta,Israel,Jesus  # a esos
      .\AvisarNuevaVersionNestoApp.ps1 -Version 2.22.0 -Usuarios ... -Texto "Otro texto"
#>
param(
    [Parameter(Mandatory = $true)][string]$Version,
    [string[]]$Usuarios = @(),
    [string]$Texto,
    [switch]$Prueba,
    [string]$Api = "http://api.nuevavision.es"
)

$ErrorActionPreference = "Stop"
if ($Prueba) { $Usuarios = @("Carlos") }
if ($Usuarios.Count -eq 0) { throw "Falta -Usuarios (o -Prueba). Ver la consulta de la cabecera." }

if (-not $Texto) {
    $Texto = "Para estrenarla: cierra la app del todo (quítala de las apps recientes), ábrela con conexión y espera unos segundos. " +
             "Luego ciérrala del todo otra vez y vuelve a abrirla. En tu perfil verás «Versión actualización $Version»."
}

# PowerShell 7 no manda las credenciales de Windows por http sin este permiso explícito (la API va por http).
$sinCifrar = @{}
if ($PSVersionTable.PSVersion.Major -ge 6 -and $Api.StartsWith("http:")) { $sinCifrar.AllowUnencryptedAuthentication = $true }
$token = (Invoke-RestMethod -Method Post -Uri "$Api/api/auth/windows-token" -UseDefaultCredentials @sinCifrar).token
if (-not $token) { throw "No se ha obtenido el token de Windows." }

$avisados = 0
foreach ($usuario in $Usuarios) {
    $usuario = ($usuario -split '\\')[-1].Trim()   # NestoApp registra los usuarios sin dominio
    $cuerpo = @{
        Destinatario = $usuario
        Aplicacion   = "NestoApp"
        Notificacion = @{
            Titulo = "NestoApp $Version ya está disponible"
            Cuerpo = $Texto
            Tipo   = "NuevaVersionNestoApp"
            Datos  = @{ tipo = "NuevaVersionNestoApp"; version = $Version; ruta = "/profile" }
        }
    } | ConvertTo-Json -Depth 5
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($cuerpo)
    $enviados = Invoke-RestMethod -Method Post -Uri "$Api/api/Notificaciones/Enviar" `
        -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json; charset=utf-8" -Body $bytes
    Write-Host ("  {0}: {1} dispositivo(s)" -f $usuario, $enviados)
    if ($enviados -gt 0) { $avisados++ }
}
Write-Host "Avisados $avisados de $($Usuarios.Count) usuarios de la versión $Version." -ForegroundColor Green
