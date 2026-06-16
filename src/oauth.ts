export const OAuthSettings = {
    appId: '115eb7f5-3503-449b-bf89-c3eb9ae83038',
    // Issue #88: deep link Android registrado en Azure AD (paquete + signature hash del keystore release).
    // Microsoft devuelve el código de autorización a esta URL; Android la entrega a la app por el
    // <intent-filter> de msauth:// en AndroidManifest.xml.
    redirectUri: 'msauth://com.ionicframework.nestoapp958858/eVhDwk8/APaxvGr+8otrC1djq7Q=',
    scopes: [
      'User.Read',
      'MailboxSettings.Read',
      'Calendars.ReadWrite'
    ]
};
