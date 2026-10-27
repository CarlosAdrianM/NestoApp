<#
    Ritual al promocionar NestoApp a Production (Carlos, 30/09/26): después de promocionar en AppFlow y
    ejecutar scripts/Novedades_<version>.sql, manda una push a todos los móviles con NestoApp diciendo cómo
    estrenar la versión nueva. Queda también en su buzón de avisos. Al tocarla se abre el perfil (novedades).

    Por qué dos cierres: Live Updates está en modo «background» (capacitor.config.ts). Descarga la versión al
    arrancar la app EN FRÍO y la estrena en el SIGUIENTE arranque en frío; volver desde segundo plano no cuenta.

    Desde NestoAPI#579 (2.26.0, 27/10/26) usa POST api/Notificaciones/NuevaVersionNestoApp, que manda a TODOS los
    dispositivos activos de NestoApp de una vez (ya no hay que sacar los usuarios de dbo.DispositivosNotificaciones).
    Gemelo de Scripts/AvisarNuevaVersionNestoApp.ps1 de NestoAPI, con -PedirCredenciales para fuera del dominio.

    Uso (desde Windows, con el usuario de alguien de Dirección o Informática). Desde un equipo que no está en el
    dominio (sesión local, como el portátil de Carlos) la API da 401: añadir -PedirCredenciales y escribir
    NUEVAVISION\usuario y su contraseña.
      .\AvisarNuevaVersionNestoApp.ps1 -Version 2.26.0 -SoloListar                  # a quién se mandaría, sin mandar nada
      .\AvisarNuevaVersionNestoApp.ps1 -Version 2.26.0 -Prueba                      # solo a Carlos, para verla antes
      .\AvisarNuevaVersionNestoApp.ps1 -Version 2.26.0 -Prueba -PedirCredenciales   # fuera del dominio
      .\AvisarNuevaVersionNestoApp.ps1 -Version 2.26.0                              # a todos los dispositivos activos de NestoApp
      .\AvisarNuevaVersionNestoApp.ps1 -Version 2.26.0 -Usuarios Marta,Israel       # solo a esos (p. ej. a quien no la recibió)
      .\AvisarNuevaVersionNestoApp.ps1 -Version 2.26.0 -Texto "Texto distinto del de siempre"
#>
param(
    [Parameter(Mandatory = $true)][string]$Version,
    [string[]]$Usuarios = @(),
    [string]$Texto,
    [switch]$SoloListar,
    [switch]$Prueba,
    [string]$UsuarioPrueba = "Carlos",
    [switch]$PedirCredenciales,
    [string]$Api = "http://api.nuevavision.es"
)

$ErrorActionPreference = "Stop"
# Con «powershell -File …» la lista llega como un único texto «Marta,Israel,…»: se parte aquí.
$Usuarios = @($Usuarios | ForEach-Object { $_ -split ',' } | ForEach-Object { ($_ -split '\\')[-1].Trim() } | Where-Object { $_ })
if ($Prueba) { $Usuarios = @($UsuarioPrueba) }

# PowerShell 7 no manda las credenciales de Windows por http sin este permiso explícito (la API va por http).
$sinCifrar = @{}
if ($PSVersionTable.PSVersion.Major -ge 6 -and $Api.StartsWith("http:")) { $sinCifrar.AllowUnencryptedAuthentication = $true }
$autenticacion = @{ UseDefaultCredentials = $true }
if ($PedirCredenciales) {
    $autenticacion = @{ Credential = (Get-Credential -Message "Usuario del dominio (NUEVAVISION\usuario)") }
}
$token = (Invoke-RestMethod -Method Post -Uri "$Api/api/auth/windows-token" @autenticacion @sinCifrar).token
if (-not $token) { throw "No se ha obtenido el token de Windows." }

# Sin Texto, la API pone el de siempre (los dos cierres en frío). Sin Usuarios, a todos los dispositivos activos.
$datos = @{ Version = $Version; Texto = $Texto; SoloListar = [bool]$SoloListar }
if ($Usuarios.Count -gt 0) { $datos.Usuarios = $Usuarios }
$bytes = [System.Text.Encoding]::UTF8.GetBytes(($datos | ConvertTo-Json))
$resultado = Invoke-RestMethod -Method Post -Uri "$Api/api/Notificaciones/NuevaVersionNestoApp" `
    -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json; charset=utf-8" -Body $bytes

if ($SoloListar) {
    Write-Host "Se mandaría la push de la $($resultado.Version) a $(@($resultado.Usuarios).Count) usuarios con NestoApp:" -ForegroundColor Cyan
} else {
    Write-Host "Push de la $($resultado.Version) mandada a $($resultado.Avisados) usuarios:" -ForegroundColor Green
}
$resultado.Usuarios | ForEach-Object { Write-Host "  $_" }
