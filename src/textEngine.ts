/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PALETTE, type PaletteKey } from './pixelEngine.ts';

// ============================================================================
// BITMAP FONT DEFINITIONS
// Covers A-Z, 0-9 and + - : / . x ! ? > < ( ) , ' % $ and space
// ============================================================================

export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'it';

let activeLanguage: Language = 'en';

export function setLanguage(lang: Language) {
  activeLanguage = lang;
}

export function getLanguage(): Language {
  return activeLanguage;
}

export const MULTI_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'menu.levels': {
    en: 'LEVELS',
    es: 'NIVELES',
    fr: 'NIVEAUX',
    de: 'LEVELS',
    pt: 'NÍVEIS',
    it: 'LIVELLI',
  },
  'menu.hatchEgg': {
    en: 'HATCH THE EGG',
    es: 'ECLOSIONA EL HUEVO',
    fr: 'FAIRE ÉCLORE L\'ŒUF',
    de: 'BRÜTE DAS EI AUS',
    pt: 'CHOCAR O OVO',
    it: 'SCHIUDI L\'UOVO',
  },
  'hud.sandbox': {
    en: 'SANDBOX',
    es: 'SANDBOX',
    fr: 'BAC À SABLE',
    de: 'SANDKASTEN',
    pt: 'SANDBOX',
    it: 'SANDBOX',
  },
  'hud.lvl': {
    en: 'LV',
    es: 'NV',
    fr: 'NIV',
    de: 'LV',
    pt: 'NV',
    it: 'LV',
  },
  'hud.mode': {
    en: 'MODE',
    es: 'MODO',
    fr: 'MODE',
    de: 'MODUS',
    pt: 'MODO',
    it: 'MODALITÀ',
  },
  'hud.shop': {
    en: 'SHOP',
    es: 'TIENDA',
    fr: 'BOUTIQUE',
    de: 'SHOP',
    pt: 'LOJA',
    it: 'NEGOZIO',
  },
  'hud.time': {
    en: 'TIME:',
    es: 'TIEMPO:',
    fr: 'TEMPS:',
    de: 'ZEIT:',
    pt: 'TEMPO:',
    it: 'TEMPO:',
  },
  'hud.final': {
    en: 'FINAL:',
    es: 'FINAL:',
    fr: 'FINAL:',
    de: 'FINAL:',
    pt: 'FINAL:',
    it: 'FINALE:',
  },
  'menu.sandbox': {
    en: 'SANDBOX MODE',
    es: 'MODO SANDBOX',
    fr: 'MODE BAC À SABLE',
    de: 'SANDKASTEN MODUS',
    pt: 'MODO SANDBOX',
    it: 'MODALITÀ SANDBOX',
  },
  'menu.language': { en: 'LANGUAGE', es: 'IDIOMA', fr: 'LANGUE', de: 'SPRACHE', pt: 'IDIOMA', it: 'LINGUA' },
  'settings.graphics': { en: 'GRAPHICS', es: 'GRÁFICOS', fr: 'GRAPHISMES', de: 'GRAFIK', pt: 'GRÁFICOS', it: 'GRAFICA' },
  'settings.optimization': { en: 'OPTIMIZATION', es: 'OPTIMIZACIÓN', fr: 'OPTIMISATION', de: 'OPTIMIERUNG', pt: 'OPTIMIZAÇÃO', it: 'OTTIMIZZAZIONE' },
  'settings.waterFx': { en: 'WATER FX', es: 'EFECTOS AGUA', fr: 'EFFETS EAU', de: 'WASSER FX', pt: 'EFEITOS ÁGUA', it: 'EFFETTI ACQUA' },
  'settings.fpsCap': { en: 'FPS CAP', es: 'LÍMITE FPS', fr: 'LIMITE FPS', de: 'FPS LIMIT', pt: 'LIMITE FPS', it: 'LIMITI FPS' },
  'settings.lowPower': { en: 'LOW POWER', es: 'AHORRO BATERÍA', fr: 'ÉCONOMIE ÉNERGIE', de: 'ENERGIESPAREN', pt: 'MODO BATERIA', it: 'RISPARMIO ENERGIA' },
  'settings.resetData': { en: 'RESET DATA', es: 'BORRAR DATOS', fr: 'RÉINITIALISER', de: 'DATEN ZURÜCKSETZEN', pt: 'REDEFINIR DADOS', it: 'AZZERA DATI' },
  'settings.confirmTitle': { en: 'CONFIRM RESET?', es: '¿CONFIRMAR REINICIO?', fr: 'CONFIRMER RÉINITIALISATION ?', de: 'ZURÜCKSETZEN BESTÄTIGEN?', pt: 'CONFIRMAR REDEFINIÇÃO?', it: 'CONFERMA RIPRISTINO?' },
  'settings.confirmWarn1': { en: 'ARE YOU SURE YOU WANT TO RESET ALL PROGRESS?', es: '¿SEGURO QUE DESEAS BORRAR TODO TU PROGRESO?', fr: 'ÊTES-VOUS SÛR DE VOULOIR RÉINITIALISER ?', de: 'BIST DU SICHER, DASS DU ALLES ZURÜCKSETZEN WILLST?', pt: 'TEM CERTEZA DE QUE DESEJA APAGAR SEU PROGRESSO?', it: 'SEI SICURO DI VOLER AZZERARE TUTTI I MIEI PROGRESSI?' },
  'settings.confirmWarn2': { en: 'ALL UNLOCKED LEVELS AND SAVED DATA WILL BE ERASED!', es: '¡TODOS LOS NIVELES Y TEMAS SE BORRARÁN PARA SIEMPRE!', fr: 'TOUS LES NIVEAUX ET THÈMES SERONT EFFACÉS !', de: 'ALLE FREIGESCHALTETEN LEVELS WERDEN GELÖSCHT!', pt: 'TODOS OS NÍVEIS E TEMAS SERÃO APAGADOS!', it: 'TUTTI I LIVELLI E TEMI VERRANNO CANCELLATI!' },
  'settings.cancel': { en: 'CANCEL', es: 'CANCELAR', fr: 'ANNULER', de: 'ABBRECHEN', pt: 'CANCELAR', it: 'ANNULLA' },
  'settings.confirmErase': { en: 'ERASE ALL DATA', es: 'BORRAR TODO', fr: 'EFFACER TOUT', de: 'ALLES LÖSCHEN', pt: 'APAGAR TUDO', it: 'CANCELLA TUTTO' },
  'profile.whatsYourName': { en: "WHAT'S YOUR NAME?", es: '¿CUÁL ES TU NOMBRE?', fr: 'QUEL EST VOTRE NOM ?', de: 'WIE HEISST DU?', pt: 'QUAL É O SEU NOME?', it: 'COME TI CHIAMI?' },
  'profile.welcomeBack': { en: 'WELCOME BACK,', es: 'BIENVENIDO DE NUEVO,', fr: 'BON RETOUR,', de: 'WILLKOMMEN ZURÜCK,', pt: 'BEM-VINDO DE VOLTA,', it: 'BENTORNATO,' },
  'profile.welcome': { en: 'WELCOME,', es: 'BIENVENIDO,', fr: 'BIENVENUE,', de: 'WILLKOMMEN,', pt: 'BEM-VINDO,', it: 'BENVENUTO,' },
  'profile.changeUser': { en: 'CHANGE USER', es: 'CAMBIAR USUARIO', fr: 'CHANGER DE JOUEUR', de: 'BENUTZER WECHSELN', pt: 'TROCAR USUÁRIO', it: 'CAMBIA UTENTE' },
  'profile.whoAreYou': { en: 'WHO ARE YOU?', es: '¿QUIÉN ERES?', fr: 'QUI ÊTES-VOUS ?', de: 'WER BIST DU?', pt: 'QUEM É VOCÊ?', it: 'CHI SEI?' },
  'profile.new': { en: 'NEW', es: 'NUEVO', fr: 'NOUVEAU', de: 'NEU', pt: 'NOVO', it: 'NUOVO' },
  'profile.rename': { en: 'RENAME', es: 'RENOMBRAR', fr: 'RENOMMER', de: 'UMBENENNEN', pt: 'RENOMEAR', it: 'RINOMINA' },
  'profile.delete': { en: 'DELETE', es: 'ELIMINAR', fr: 'SUPPRIMER', de: 'LÖSCHEN', pt: 'EXCLUIR', it: 'ELIMINA' },
  'profile.ok': { en: 'OK', es: 'ACEPTAR', fr: 'OK', de: 'OK', pt: 'OK', it: 'OK' },
  'profile.cancel': { en: 'CANCEL', es: 'CANCELAR', fr: 'ANNULER', de: 'ABBRECHEN', pt: 'CANCELAR', it: 'ANNULLA' },
  'profile.maxPlayers': { en: 'MAX 8 PLAYERS', es: 'MÁX. 8 JUGADORES', fr: 'MAX 8 JOUEURS', de: 'MAX. 8 SPIELER', pt: 'MÁX. 8 JOGADORES', it: 'MAX 8 GIOCATORI' },
  'profile.storageUnavailable': { en: 'SAVING IS UNAVAILABLE IN THIS BROWSER', es: 'EL GUARDADO NO ESTÁ DISPONIBLE EN ESTE NAVEGADOR', fr: 'SAUVEGARDE INDISPONIBLE DANS CE NAVIGATEUR', de: 'SPEICHERN IN DIESEM BROWSER NICHT MÖGLICH', pt: 'SALVAMENTO INDISPONÍVEL NESTE NAVEGADOR', it: 'SALVATAGGIO NON DISPONIBILE IN QUESTO BROWSER' },
  'profile.enterName': { en: 'ENTER A NAME', es: 'INGRESA UN NOMBRE', fr: 'ENTREZ UN NOM', de: 'NAMEN EINGEBEN', pt: 'DIGITE UM NOME', it: 'INSERISCI UN NOME' },
  'profile.nameTaken': { en: 'NAME TAKEN', es: 'NOMBRE OCUPADO', fr: 'NOM DÉJÀ PRIS', de: 'NAME VERGEBEN', pt: 'NOME JÁ EM USO', it: 'NOME GIÀ IN USO' },
  'profile.deleteConfirm': { en: 'DELETE {0} AND ALL THEIR PROGRESS?', es: '¿ELIMINAR A {0} Y TODO SU PROGRESO?', fr: 'SUPPRIMER {0} ET TOUTE SA PROGRESSION ?', de: '{0} UND GESAMTEN FORTSCHRITT LÖSCHEN?', pt: 'EXCLUIR {0} E TODO SEU PROGRESSO?', it: 'ELIMINARE {0} E TUTTI I SUOI PROGRESSI?' },
  'profile.deleteTitle': { en: 'DELETE?', es: '¿BORRAR?', fr: 'SUPPR. ?', de: 'LÖSCHEN?', pt: 'EXCLUIR?', it: 'ELIM.?' },
  'profile.deleteWarn': { en: 'ALL PROGRESS WILL BE LOST.', es: 'TODO EL PROGRESO SE PERDERÁ.', fr: 'TOUTE LA PROGRESSION SERA PERDUE.', de: 'FORTSCHRITT GEHT VERLOREN.', pt: 'TODO O PROGRESSO SERÁ PERDIDO.', it: 'TUTTI I PROGRESSI ANDRANNO PERSI.' },
};

export const ACCOUNT_SHORT_FORMS: Record<string, Record<Language, string>> = {
  'profile.new': { en: 'NEW', es: 'NUEVO', fr: 'NOUV.', de: 'NEU', pt: 'NOVO', it: 'NUOVO' },
  'profile.rename': { en: 'EDIT', es: 'EDITAR', fr: 'ÉDITER', de: 'EDIT', pt: 'EDITAR', it: 'EDITA' },
  'profile.delete': { en: 'DEL', es: 'BORRAR', fr: 'SUPPR.', de: 'LÖSCHEN', pt: 'EXCLUIR', it: 'ELIM.' },
  'profile.ok': { en: 'OK', es: 'OK', fr: 'OK', de: 'OK', pt: 'OK', it: 'OK' },
  'profile.cancel': { en: 'CANCEL', es: 'CANCEL', fr: 'ANNUL.', de: 'ABBR.', pt: 'CANCEL', it: 'ANNUL.' },
  'profile.changeUser': { en: 'CHANGE', es: 'CAMBIAR', fr: 'CHANGER', de: 'WECHSEL', pt: 'TROCAR', it: 'CAMBIA' },
  'profile.welcome': { en: 'WELCOME', es: 'HOLA', fr: 'SALUT', de: 'HALLO', pt: 'OLÁ', it: 'CIAO' },
  'profile.welcomeBack': { en: 'WELCOME', es: 'HOLA', fr: 'SALUT', de: 'HALLO', pt: 'OLÁ', it: 'CIAO' },
  'profile.whoAreYou': { en: 'WHO?', es: 'QUIÉN?', fr: 'QUI ?', de: 'WER?', pt: 'QUEM?', it: 'CHI?' },
  'profile.whatsYourName': { en: 'NAME?', es: 'NOMBRE?', fr: 'NOM ?', de: 'NAME?', pt: 'NOME?', it: 'NOME?' },
  'profile.deleteTitle': { en: 'DELETE?', es: 'BORRAR?', fr: 'SUPPR.?', de: 'LÖSCH?', pt: 'EXCL.?', it: 'ELIM.?' },
  'profile.deleteWarn': { en: 'LOST', es: 'PERDIDO', fr: 'PERDU', de: 'VERLOREN', pt: 'PERDIDO', it: 'PERSO' },
  'profile.storageUnavailable': { en: 'NO SAVE', es: 'SIN GRAV', fr: 'NO SAVE', de: 'KEIN SP', pt: 'SEM GRAV', it: 'NO SALVA' },
  'profile.maxPlayers': { en: 'MAX 8', es: 'MÁX 8', fr: 'MAX 8', de: 'MAX 8', pt: 'MÁX 8', it: 'MAX 8' },
  'profile.enterName': { en: 'NAME', es: 'NOMBRE', fr: 'UN NOM', de: 'NAME', pt: 'UM NOME', it: 'UN NOME' },
  'profile.nameTaken': { en: 'TAKEN', es: 'OCUPADO', fr: 'PRIS', de: 'BESETZT', pt: 'EM USO', it: 'IN USO' },
};

export function tShort(key: string, lang?: Language): string {
  const targetLang = lang || getLanguage();
  if (ACCOUNT_SHORT_FORMS[key] && ACCOUNT_SHORT_FORMS[key][targetLang]) {
    return ACCOUNT_SHORT_FORMS[key][targetLang];
  }
  return t(key, targetLang);
}

export const MULTI_TRANSLATIONS_PART2: Record<string, Record<Language, string>> = {
  'sandbox.mods': { en: 'MODS', es: 'MODS', fr: 'MODS', de: 'MODS', pt: 'MODS', it: 'MODS' },
  'sandbox.rules': { en: 'RULES', es: 'REGLAS', fr: 'RÈGLES', de: 'REGELN', pt: 'REGRAS', it: 'REGOLE' },
  'sandbox.cheats': { en: 'CHEATS', es: 'TRUCOS', fr: 'TRICHER', de: 'CHEATS', pt: 'TRUQUES', it: 'TRUCCHI' },
  'sandbox.spawn': { en: 'SPAWN', es: 'GENERAR', fr: 'APPARITION', de: 'SPAWN', pt: 'GERAR', it: 'SPAWN' },
  'sandbox.freeShop': { en: 'Free Shop', es: 'Tienda Gratis', fr: 'Boutique Gratuite', de: 'Kostenloser Shop', pt: 'Loja Grátis', it: 'Negozio Gratis' },
  'sandbox.freeFood': { en: 'Free Food', es: 'Comida Gratis', fr: 'Nourriture Gratuite', de: 'Kostenloses Futter', pt: 'Ração Grátis', it: 'Cibo Gratis' },
  'sandbox.hunger': { en: 'Fish Hunger', es: 'Hambre Peces', fr: 'Faim Poissons', de: 'Fisch-Hunger', pt: 'Fome dos Peixes', it: 'Fame Pesci' },
  'sandbox.aliens': { en: 'Aliens Spawn', es: 'Aparecer Aliens', fr: 'Apparition Aliens', de: 'Aliens Spawnen', pt: 'Gerar Aliens', it: 'Spawn Alieni' },
  'sandbox.godMode': { en: 'God Mode', es: 'Modo Dios', fr: 'Mode Dieu', de: 'Gott-Modus', pt: 'Modo Deus', it: 'Modalità Dio' },
  'sandbox.autoCollect': { en: 'Auto Collect', es: 'Auto Recoger', fr: 'Collecte Auto', de: 'Auto-Sammeln', pt: 'Coleta Auto', it: 'Raccolta Auto' },
  'sandbox.limitBreaker': { en: 'Limit Breaker', es: 'Romper Límite', fr: 'Dépasse-Limite', de: 'Limit-Brecher', pt: 'Quebrar Limite', it: 'Sblocca Limiti' },
  'sandbox.speed': { en: 'Speed', es: 'Velocidad', fr: 'Vitesse', de: 'Tempo', pt: 'Velocidade', it: 'Velocità' },
  'sandbox.add100': { en: '+$100', es: '+$100', fr: '+$100', de: '+$100', pt: '+$100', it: '+$100' },
  'sandbox.add1000': { en: '+$1,000', es: '+$1.000', fr: '+$1 000', de: '+$1.000', pt: '+$1.000', it: '+$1.000' },
  'sandbox.add10000': { en: '+$10,000', es: '+$10.000', fr: '+$10 000', de: '+$10.000', pt: '+$10.000', it: '+$10.000' },
  'sandbox.feedAll': { en: 'Feed All Fish', es: 'Alimentar Todos', fr: 'Nourrir Tous', de: 'Alle Füttern', pt: 'Alimentar Todos', it: 'Nutri Tutti' },
  'sandbox.growAll': { en: 'Grow All', es: 'Crecer Todos', fr: 'Grandir Tous', de: 'Alle Wachsen', pt: 'Crescer Todos', it: 'Cresci Tutti' },
  'sandbox.collectCoins': { en: 'Collect Coins', es: 'Recoger Monedas', fr: 'Récolter Pièces', de: 'Münzen Sammeln', pt: 'Pegar Moedas', it: 'Raccogli Monete' },
  'sandbox.maxUpgrades': { en: 'Max Upgrades', es: 'Max Mejoras', fr: 'Améliorations Max', de: 'Max Upgrades', pt: 'Melhorias Máx', it: 'Miglioramenti Max' },
  'sandbox.spawnFish': { en: 'Spawn Fish', es: 'Generar Pez', fr: 'Creer Poisson', de: 'Fisch Spawnen', pt: 'Gerar Peixe', it: 'Crea Pesce' },
  'sandbox.spawnGargo': { en: 'Spawn Gargo', es: 'Generar Gargo', fr: 'Creer Gargo', de: 'Gargo Spawnen', pt: 'Gerar Gargo', it: 'Crea Gargo' },
  'sandbox.killAliens': { en: 'Kill Aliens', es: 'Eliminar Aliens', fr: 'Tuer Aliens', de: 'Aliens Töten', pt: 'Matar Aliens', it: 'Elimina Alieni' },
  'sandbox.spawnSize': { en: 'Size', es: 'Tamaño', fr: 'Taille', de: 'Größe', pt: 'Tamanho', it: 'Taglia' },
  'sandbox.carnivore': { en: 'Carnivore', es: 'Carnívoro', fr: 'Carnivore', de: 'Karnivor', pt: 'Carnívoro', it: 'Carnivoro' },
  'sandbox.snail': { en: 'Snail', es: 'Caracol', fr: 'Escargot', de: 'Schnecke', pt: 'Caracol', it: 'Chiocciola' },
  'tut.1.1': {
    en: "HI! I'M SHELLY. LET'S LEARN HOW TO RUN A TANK!",
    es: "¡HOLA! SOY SHELLY. ¡APRENDAMOS A CUIDAR EL ACUARIO!",
    fr: "SALUT ! JE SUIS SHELLY. APPRENONS À GÉRER LE BAC !",
    de: "HI! ICH BIN SHELLY. LERNEN WIR DAS AQUARIUM KENNEN!",
    pt: "OI! SOU A SHELLY. VAMOS APRENDER A CUIDAR DO AQUÁRIO!",
    it: "CIAO! SONO SHELLY. IMPARIAMO A GESTIRE L'ACQUARIO!",
  },
  'tut.1.2': {
    en: 'FEED YOUR FISH, COLLECT COINS, AND HATCH THE EGG!',
    es: '¡ALIMENTA TUS PECES, RECOGE MONEDAS Y ABRE EL HUEVO!',
    fr: "NOURRISSEZ VOS POISSONS, RÉCOLTEZ ET ÉCLOREZ L'ŒUF !",
    de: 'FÜTTERE DEINE FISCHE, SAMMLE MÜNZEN UND BRÜTE DAS EI!',
    pt: 'ALIMENTE SEUS PEIXES, PEGUE MOEDAS E CHOQUE O OVO!',
    it: "NUTRI I PESCI, RACCOGLI MONETE E SCHIUDI L'UOVO!",
  },
  'tut.2.1': {
    en: 'TAP THE WATER TO DROP FOOD.',
    es: 'TOCA EL AGUA PARA SOLTAR COMIDA.',
    fr: "TOUCHEZ L'EAU POUR LÂCHER DE LA NOURRITURE.",
    de: 'TIPPE AUF DAS WASSER, UM FUTTER EINZUFÜLLEN.',
    pt: 'TOQUE NA ÁGUA PARA SOLTAR RAÇÃO.',
    it: "TOCCA L'ACQUA PER FAR CADERE IL CIBO.",
  },
  'tut.3.1': {
    en: 'ONLY ONE FOOD AT A TIME. WAIT FOR IT TO BE EATEN, THEN FEED AGAIN!',
    es: '¡SOLO UNA COMIDA A LA VEZ! ESPERA A QUE COMAN Y VUELVE A DAR.',
    fr: 'UNE SEULE NOURRITURE À LA FOIS. ATTENDEZ ET REDONNEZ-EN !',
    de: 'NUR EIN FUTTER GLEICHZEITIG. WARTE, BIS ES GEFRESSEN WIRD!',
    pt: 'SÓ UMA RAÇÃO POR VEZ. ESPERE ELES COMEREM PARA ALIMENTAR!',
    it: 'UN SOLO CIBO ALLA VOLTA. ASPETTA CHE MANGINO E NUTRI DI NUOVO!',
  },
  'tut.3.2': {
    en: 'THEY GROW WHEN FED. GROWN FISH DROP COINS!',
    es: '¡CRECEN AL COMER! ¡LOS PECES GRANDES SUELTAN MONEDAS!',
    fr: 'ILS GRANDISSENT EN MANGEANT ET DONNENT DES PIÈCES !',
    de: 'SIE WACHSEN BEIM FÜTTERN. GROSSE FISCHE GEBEN MÜNZEN!',
    pt: 'ELES CRESCEM AO COMER. PEIXES GRANDES SOLTAM MOEDAS!',
    it: 'CRESCONO QUANDO NUTRITI. I PESCI GRANDI DANNO MONETE!',
  },
  'tut.4.1': {
    en: 'A COIN! TAP IT BEFORE IT DISAPPEARS!',
    es: '¡UNA MONEDA! ¡TÓCALA ANTES DE QUE DESAPAREZCA!',
    fr: "UNE PIÈCE ! TOUCHEZ-LA VITE AVANT QU'ELLE NE DISPARAISSE !",
    de: 'EINE MÜNZE! TIPPE DARAUF, BEVOR SIE VERSCHWINDET!',
    pt: 'UMA MOEDA! TOQUE NELA ANTES QUE ELA SUMA!',
    it: 'UNA MONETA! TOCCALA PRIMA CHE SCOMPAIA!',
  },
  'tut.4.2': {
    en: 'COINS ARE MONEY. SPEND IT IN THE SHOP!',
    es: '¡LAS MONEDAS SON DINERO! GÁSTALO EN LA TIENDA.',
    fr: "LES PIÈCES FONT L'ARGENT. DÉPENSEZ-LES DANS LA BOUTIQUE !",
    de: 'MÜNZEN SIND GELD. GIB ES IM SHOP AUS!',
    pt: 'MOEDAS SÃO DINHEIRO. GASTE NA LOJA!',
    it: 'LE MONETE SONO DENARO. SPENDILO NEL NEGOZIO!',
  },
  'tut.5.1': {
    en: 'TAP THE SHOP BUTTON.',
    es: 'TOCA EL BOTÓN DE LA TIENDA.',
    fr: 'TOUCHEZ LE BOUTON DE LA BOUTIQUE.',
    de: 'TIPPE AUF DIE SHOP-SCHALTFLÄCHE.',
    pt: 'TOQUE NO BOTÃO DA LOJA.',
    it: 'TOCCA IL PULSANTE DEL NEGOZIO.',
  },
  'tut.5.2': {
    en: 'SELECT BUY FISH, THEN TAP BUY!',
    es: '¡SELECCIONA COMPRAR PEZ Y LUEGO TOCA COMPRAR!',
    fr: 'SÉLECTIONNEZ ACHETER POISSON, PUIS TOUCHEZ ACHETER !',
    de: 'WÄHLE FISCH KAUFEN UND TIPPE AUF KAUFEN!',
    pt: 'SELECIONE COMPRAR PEIXE E TOQUE EM COMPRAR!',
    it: 'SELEZIONA COMPRA PESCE E POI TOCCA COMPRA!',
  },
  'tut.6.1': {
    en: 'NOW OPEN THE UPGRADES TAB.',
    es: 'AHORA ABRE LA PESTAÑA DE MEJORAS.',
    fr: "OUVREZ MAINTENANT L'ONGLET AMÉLIORATIONS.",
    de: 'ÖFFNE JETZT DEN REITER UPGRADES.',
    pt: 'AGORA ABRA A ABA DE MELHORIAS.',
    it: 'ORA APRI LA SCHEDA MIGLIORIE.',
  },
  'tut.6.2': {
    en: 'SELECT FOOD LIMIT AND BUY IT.',
    es: 'SELECCIONA LÍMITE DE COMIDA Y CÓMPRALO.',
    fr: 'SÉLECTIONNEZ LIMITE NOURRITURE ET ACHETEZ-LA.',
    de: 'WÄHLE FUTTERLIMIT UND KAUFE ES.',
    pt: 'SELECIONE LIMITE DE RAÇÃO E COMPRE.',
    it: 'SELEZIONA LIMITE CIBO E COMPRALO.',
  },
  'tut.7.1': {
    en: 'CLOSE THE SHOP.',
    es: 'CIERRA LA TIENDA.',
    fr: 'FERMEZ LA BOUTIQUE.',
    de: 'SCHLIESSE DEN SHOP.',
    pt: 'FECHE A LOJA.',
    it: 'CHIUDI IL NEGOZIO.',
  },
  'tut.7.2': {
    en: 'DROP 2 FOODS AT ONCE!',
    es: '¡SUELTA 2 COMIDAS A LA VEZ!',
    fr: 'LÂCHEZ 2 NOURRITURES À LA FOIS !',
    de: 'GIB 2 FUTTER GLEICHZEITIG HINEIN!',
    pt: 'SOLTE 2 RAÇÕES DE UMA VEZ!',
    it: 'LASCIA CADERE 2 CIBI INSIEME!',
  },
  'tut.8.1': {
    en: 'UH-OH! AN ALIEN! TAP IT TO DEFEAT IT!',
    es: '¡OH NO! ¡UN ALIEN! ¡TÓCALO PARA DERROTARLO!',
    fr: 'OH LÀ LÀ ! UN ALIEN ! TOUCHEZ-LE POUR LE VAINCRE !',
    de: 'OH NEIN! EIN ALIEN! TIPPE DARAUF, UM ES ZU BESIEGEN!',
    pt: 'OH NÃO! UM ALIEN! TOQUE NELE PARA DERROTÁ-LO!',
    it: 'OH NO! UN ALIENO! TOCCALO PER SCONFIGGERLO!',
  },
  'tut.8.2': {
    en: 'IT DROPPED A DIAMOND! TAP IT!',
    es: '¡SOLTÓ UN DIAMANTE! ¡TÓCALO!',
    fr: 'IL A LÂCHÉ UN DIAMANT ! TOUCHEZ-LE !',
    de: 'ES HAT EINEN DIAMANTEN VERLOREN! TIPPE DARAUF!',
    pt: 'ELE SOLTOU UM DIAMANTE! TOQUE NELE!',
    it: 'HA LASCIATO UN DIAMANTE! TOCCALO!',
  },
  'tut.8.3': {
    en: 'ALIENS EAT FISH, SO DEFEAT THEM FAST!',
    es: '¡LOS ALIENS COMEN PECES, DERROTALOS RÁPIDO!',
    fr: 'LES ALIENS MANGENT LES POISSONS, TUEZ-LES VITE !',
    de: 'ALIENS FRESSEN FISCHE, BESIEGE SIE SCHNELL!',
    pt: 'ALIENS COMEM PEIXES, DERROTE-OS RÁPIDO!',
    it: 'GLI ALIENI MANGIANO I PESCI, SCONFIGGILI IN FRETTA!',
  },
  'tut.9.1': {
    en: 'THESE 3 SLOTS ARE THE EGG. BUY ALL 3 PIECES TO WIN THE LEVEL!',
    es: 'ESTAS 3 RANURAS SON EL HUEVO. ¡COMPRA LAS 3 PARA GANAR EL NIVEL!',
    fr: "CES 3 SLOTS SONT L'ŒUF. ACHETEZ LES 3 PIÈCES POUR GAGNER LE NIVEAU !",
    de: 'DIESE 3 SLOTS SIND DAS EI. KAUFE ALLE 3 TEILE ZUM GEWINNEN!',
    pt: 'ESTES 3 ESPAÇOS SÃO O OVO. COMPRE AS 3 PARTES PARA VENCER O NÍVEL!',
    it: "QUESTI 3 SLOT SONO L'UOVO. COMPRA TUTTI E 3 I PEZZI PER VINCERE!",
  },
  'tut.9.2': {
    en: 'THE EGG HATCHES A BRAND NEW FISH AS YOUR REWARD!',
    es: '¡EL HUEVO ABRE UN PEZ TOTALMENTE NUEVO COMO RECOMPENSA!',
    fr: "L'ŒUF ÉCLÔT UN TOUT NOUVEAU POISSON EN RÉCOMPENSE !",
    de: 'DAS EI BRÜTET EINEN BRANDNEUEN FISCH ALS BELOHNUNG AUS!',
    pt: 'O OVO CHOCA UM NOVO PEIXE COMO SUA RECOMPENSA!',
    it: "L'UOVO SCHIUDE UN PESCE NUOVO DI ZECCA COME PREMIO!",
  },
  'tut.10.1': {
    en: "YOU'RE READY! GOOD LUCK!",
    es: '¡ESTÁS LISTO! ¡BUENA SUERTE!',
    fr: 'VOUS ÊTES PRÊT ! BONNE CHANCE !',
    de: 'DU BIST BEREIT! VIEL GLÜCK!',
    pt: 'VOCÊ ESTÁ PRONTO! BOA SORTE!',
    it: 'SEI PRONTO! BUONA FORTUNA!',
  },
  'tut.sb.1.1': {
    en: "WELCOME TO SANDBOX MODE! YOU HAVE FULL FREEDOM TO BUILD YOUR TANK.",
    es: "¡BIENVENIDO AL MODO SANDBOX! TIENES LIBERTAD TOTAL PARA TU ACUARIO.",
    fr: "BIENVENUE EN MODE SANDBOX ! CRÉEZ VOTRE AQUARIUM EN TOUTE LIBERTÉ.",
    de: "WILLKOMMEN IM SANDBOX-MODUS! BAUE DEIN AQUARIUM GANZ NACH WUNSCH.",
    pt: "BEM-VINDO AO MODO SANDBOX! LIBERDADE TOTAL PARA CRIAR SEU AQUÁRIO.",
    it: "BENVENUTO IN MODALITÀ SANDBOX! LIBERTÀ TOTALE PER IL TUO ACQUARIO.",
  },
  'tut.sb.1.2': {
    en: "TAP THE GEAR ICON AT THE TOP RIGHT TO OPEN THE MODS DRAWER.",
    es: "TOCA EL ENGRANAJE ARRIBA A LA DERECHA PARA ABRIR LOS MODS.",
    fr: "TOUCHEZ L'ENGRENAGE EN HAUT À DROITE POUR OUVRIR LES MODS.",
    de: "TIPPE OBEN RECHTS AUF DAS ZAHNRAD, UM DAS MOD-MENÜ ZU ÖFFNEN.",
    pt: "TOQUE NA ENGRENAGEM NO CANTO SUPERIOR DIREITO PARA ABRIR OS MODS.",
    it: "TOCCA L'INGRANAGGIO IN ALTO A DESTRA PER APRIRE IL MENU MOD.",
  },
  'tut.sb.2.1': {
    en: "USE THE TABS TO TOGGLE RULES, ACTIVATE CHEATS, OR SPAWN CREATURES!",
    es: "¡USA LAS PESTAÑAS PARA REGLAS, TRUCOS O GENERAR CRIATURAS!",
    fr: "UTILISEZ LES ONGLETS POUR LES RÈGLES, TRICHER OU CRÉER DES CRÉATURES !",
    de: "NUTZE DIE REITER FÜR REGELN, CHEATS ODER UM WESEN ZU ERSCHAFFEN!",
    pt: "USE AS ABAS PARA REGRAS, TRUQUES OU GERAR CRIATURAS!",
    it: "USA LE SCHEDE PER REGOLE, TRUCCHI O PER GENERARE CREATURE!",
  },
  'tut.sb.2.2': {
    en: "CUSTOMIZE FREELY! SANDBOX PROGRESS IS INDEPENDENT FROM STORY LEVELS.",
    es: "¡PERSONALIZA A TU GUSTO! EL MODO SANDBOX ES INDEPENDIENTE DE LA HISTORIA.",
    fr: "PERSONNALISEZ LIBREMENT ! LE SANDBOX N'AFFECTE PAS LES NIVEAUX.",
    de: "GESTALTE FREI! DER SANDBOX-MODUS IST UNABHÄNGIG VOM STORY-MODUS.",
    pt: "PERSONALIZE À VONTADE! O SANDBOX É INDEPENDENTE DA HISTÓRIA.",
    it: "PERSONALIZZA LIBERAMENTE! IL SANDBOX È SEPARATO DALLA STORIA.",
  },
  'tut.sb.3.1': {
    en: "HAVE FUN EXPERIMENTING WITH YOUR ULTIMATE AQUARIUM!",
    es: "¡DIVIÉRTETE EXPERIMENTANDO CON TU ACUARIO DEFINITIVO!",
    fr: "AMUSEZ-VOUS À EXPÉRIMENTER DANS VOTRE AQUARIUM !",
    de: "VIEL SPASS BEIM EXPERIMENTIEREN IN DEINEM AQUARIUM!",
    pt: "DIVIRTA-SE EXPERIMENTANDO COM SEU AQUÁRIO DEFINITIVO!",
    it: "DIVERTITI A SPERIMENTARE CON IL TUO ACQUARIO DEI SOGNI!",
  },
  'tut.welcome': {
    en: 'Welcome to the Tank! Tap to continue.',
    es: '¡Bienvenido al Tanque! Toca para continuar.',
    fr: 'Bienvenue dans le Tank ! Appuyez pour continuer.',
    de: 'Willkommen im Tank! Zum Fortfahren tippen.',
    pt: 'Bem-vindo ao Tanque! Toque para continuar.',
    it: 'Benvenuto nel Tank! Tocca per continuare.',
  },
  'tut.buyFish': {
    en: 'Open SHOP and buy your first GUPPY!',
    es: '¡Abre la TIENDA y compra tu primer GUPPY!',
    fr: 'Ouvrez la BOUTIQUE et achetez votre premier GUPPY !',
    de: 'Öffne den SHOP und kauf dein erstes GUPPY!',
    pt: 'Abra a LOJA e compre o seu primeiro GUPPY!',
    it: 'Apri il NEGOZIO e compra il tuo primo GUPPY!',
  },
  'tut.feed': {
    en: 'Tap the water to drop FOOD. Hungry fish are green!',
    es: 'Toca el agua para soltar COMIDA. ¡Los peces hambrientos son verdes!',
    fr: 'Appuyez sur l\'eau pour lâcher de la NOURRITURE. Les poissons affamés sont verts !',
    de: 'Tippe auf das Wasser, um FUTTER fallen zu lassen. Hungrige Fische sind grün!',
    pt: 'Toque na água para soltar COMIDA. Peixes famintos ficam verdes!',
    it: 'Tocca l\'acqua per far cadere il CIBO. I pesci affamati sono verdi!',
  },
  'tut.coins': {
    en: 'Fish drop COINS! Tap them to collect money.',
    es: '¡Los peces sueltan MONEDAS! Tócalas para recoger dinero.',
    fr: 'Les poissons lâchent des PIÈCES ! Appuyez dessus pour collecter l\'argent.',
    de: 'Fische lassen MÜNZEN fallen! Tippe sie an, um Geld zu sammeln.',
    pt: 'Os peixes soltam MOEDAS! Toque nelas para coletar dinheiro.',
    it: 'I pesci rilasciano MONETE! Toccale per raccogliere soldi.',
  },
  'tut.grow': {
    en: 'Feed fish enough and they will GROW!',
    es: '¡Alimenta a los peces lo suficiente y CRECERÁN!',
    fr: 'Nourrissez les poissons suffisamment et ils GRANDIRONT !',
    de: 'Füttere die Fische genug und sie werden WACHSEN!',
    pt: 'Alimente os peixes o suficiente e eles CRESCERÃO!',
    it: 'Nutri i pesci a sufficienza e CRESCERANNO!',
  },
  'tut.foodLimit': {
    en: 'Buy FOOD LIMIT to drop more pellets at once.',
    es: 'Compra LÍMITE DE COMIDA para soltar más pellets a la vez.',
    fr: 'Achetez la LIMITE DE NOURRITURE pour lâcher plus de granulés à la fois.',
    de: 'Kauf FUTTERLIMIT, um mehr Pellets gleichzeitig fallen zu lassen.',
    pt: 'Compre LIMITE DE COMIDA para soltar mais ração de uma vez.',
    it: 'Compra il LIMITE CIBO per far cadere più pellet contemporaneamente.',
  },
  'tut.egg': {
    en: 'Buy 3 EGG PIECES to complete the level!',
    es: '¡Compra 3 PIEZAS DE HUEVO para completar el nivel!',
    fr: 'Achetez 3 PIÈCES D\'ŒUF pour terminer le niveau !',
    de: 'Kauf 3 EIERSTÜCKE, um das Level abzuschließen!',
    pt: 'Compre 3 PEÇAS DE OVO para completar o nível!',
    it: 'Compra 3 PEZZI DI UOVO per completare il livello!',
  },
  'tut.hatch': {
    en: 'Now buy the last piece and HATCH the egg!',
    es: '¡Ahora compra la última pieza y ECLOSIONA el huevo!',
    fr: 'Maintenant, achetez la dernière pièce et faites ÉCLORE l\'œuf !',
    de: 'Kauf jetzt das letzte Stück und BRÜTE das Ei aus!',
    pt: 'Agora compre a última peça e CHOQUE o ovo!',
    it: 'Ora compra l\'ultimo pezzo e SCHIUDI l\'uovo!',
  },
  'tut.complete': {
    en: 'Amazing! You hatched a new PET.',
    es: '¡Increíble! Has eclosionado una nueva MASCOTA.',
    fr: 'Incroyable ! Vous avez fait éclore un nouvel ANIMAL.',
    de: 'Wahnsinn! Du hast ein neues HAUSTIER ausgebrütet.',
    pt: 'Incrível! Você chocou um novo PET.',
    it: 'Incredibile! Hai schiuso un nuovo ANIMALE.',
  },
  'tut.finish': {
    en: 'Tutorial finished! Start your adventure now.',
    es: '¡Tutorial terminado! Comienza tu aventura ahora.',
    fr: 'Tutoriel terminé ! Commencez votre aventure maintenant.',
    de: 'Tutorial beendet! Starte jetzt dein Abenteuer.',
    pt: 'Tutorial finalizado! Comece sua aventura agora.',
    it: 'Tutorial finito! Inizia la tua avventura ora.',
  },
  'menu.settings': {
    en: 'SETTINGS',
    es: 'AJUSTES',
    fr: 'PARAMÈTRES',
    de: 'EINSTELLUNGEN',
    pt: 'CONFIGURAÇÕES',
    it: 'IMPOSTAZIONI',
  },
  'pause.resume': {
    en: 'RESUME',
    es: 'REANUDAR',
    fr: 'REPRENDRE',
    de: 'FORTSETZEN',
    pt: 'CONTINUAR',
    it: 'RIPRENDI',
  },
  'pause.restart': {
    en: 'RESTART LEVEL',
    es: 'REINICIAR NIVEL',
    fr: 'RECOMMENCER NIVEAU',
    de: 'LEVEL NEUSTARTEN',
    pt: 'REINICIAR NÍVEL',
    it: 'RICOMINCIA LIVELLO',
  },
  'pause.mainMenu': {
    en: 'MAIN MENU',
    es: 'MENÚ PRINCIPAL',
    fr: 'MENU PRINCIPAL',
    de: 'HAUPTMENÜ',
    pt: 'MENU PRINCIPAL',
    it: 'MENU PRINCIPALE',
  },
  'pause.sandboxOptions': {
    en: 'SANDBOX OPTIONS',
    es: 'OPCIONES SANDBOX',
    fr: 'OPTIONS BAC À SABLE',
    de: 'SANDKASTEN OPTIONEN',
    pt: 'OPÇÕES SANDBOX',
    it: 'OPZIONI SANDBOX',
  },
  'pause.resetTank': {
    en: 'RESET TANK',
    es: 'REINICIAR ACUARIO',
    fr: 'RÉINITIALISER AQUARIUM',
    de: 'AQUARIUM ZURÜCKSETZEN',
    pt: 'REINICIAR AQUÁRIO',
    it: 'RIPRISTINA ACQUARIO',
  },
  'shop.free': {
    en: 'FREE',
    es: 'GRATIS',
    fr: 'GRATUIT',
    de: 'GRATIS',
    pt: 'GRÁTIS',
    it: 'GRATIS',
  },
  'menu.nextLevel': {
    en: 'NEXT LEVEL',
    es: 'SIGUIENTE NIVEL',
    fr: 'NIVEAU SUIVANT',
    de: 'NÄCHSTES LEVEL',
    pt: 'PRÓXIMO NÍVEL',
    it: 'PROSSIMO LIVELLO',
  },
  'menu.levelSelect': {
    en: 'LEVEL SELECT',
    es: 'SELECCIONAR NIVEL',
    fr: 'SÉLECTION NIVEAU',
    de: 'LEVELAUSWAHL',
    pt: 'SELEÇÃO DE NÍVEL',
    it: 'SELEZIONE LIVELLO',
  },
  'level.sunnyShallows': {
    en: 'SUNNY SHALLOWS',
    es: 'AGUAS SOLEADAS',
    fr: 'FONDS ENSOLEILLÉS',
    de: 'SONNIGE FLACHWASSER',
    pt: 'RASA ENSOLARADA',
    it: 'FONDALI SOLEGGIATI',
  },
  'level.kelpMeadow': {
    en: 'KELP MEADOW',
    es: 'PRADERA DE ALGAS',
    fr: 'PRAIRIE DE KELP',
    de: 'TANGWIESE',
    pt: 'PRADO DE ALGAS',
    it: 'PRATO DI ALGHE',
  },
  'level.coralGarden': {
    en: 'CORAL GARDEN',
    es: 'JARDÍN DE CORAL',
    fr: 'JARDIN DE CORAIL',
    de: 'KORALLENGARTEN',
    pt: 'JARDIM DE CORAL',
    it: 'GIARDINO DI CORALLO',
  },
  'level.sandyCove': {
    en: 'SANDY COVE',
    es: 'CALA ARENOSA',
    fr: 'CRICK SABLEUSE',
    de: 'SANDIGE BUCHT',
    pt: 'ENSEADA AREOSA',
    it: 'CALA SABBIOSO',
  },
  'level.goldenNoon': {
    en: 'GOLDEN NOON',
    es: 'MEDIODÍA DORADO',
    fr: 'MIDI D\'OR',
    de: 'GOLDENER MITTAG',
    pt: 'MEIO-DIA DOURADO',
    it: 'MEZZOGIORNO D\'ORO',
  },
  'level.moonlitBay': {
    en: 'MOONLIT BAY',
    es: 'BAHÍA LUNAR',
    fr: 'BAIE DE LUNE',
    de: 'MONDLICHTBUCHT',
    pt: 'BAÍA DA LUA',
    it: 'BAIA DI LUNA',
  },
  'level.glowGrotto': {
    en: 'GLOW GROTTO',
    es: 'GRUTA BRILLANTE',
    fr: 'GROTTE LUMINEUSE',
    de: 'LEUCHTGROTTE',
    pt: 'GRUTA BRILHANTE',
    it: 'GROTTA LUMINOSA',
  },
  'level.starryDeep': {
    en: 'STARRY DEEP',
    es: 'ABISMO ESTRELLADO',
    fr: 'PROFONDEUR ÉTOILÉE',
    de: 'STERNENTIEFE',
    pt: 'ABISMO ESTRELADO',
    it: 'ABISSO STELLATO',
  },
  'level.midnightReef': {
    en: 'MIDNIGHT REEF',
    es: 'ARRECIFE DE MEDIANOCHE',
    fr: 'RÉCIF DE MINUIT',
    de: 'MITTERNACHTSRIFF',
    pt: 'RECIFE DA MEIA-NOITE',
    it: 'SCOGLIERA DI MEZZANOTTE',
  },
  'level.auroraTrench': {
    en: 'AURORA TRENCH',
    es: 'FOSA AURORA',
    fr: 'FOSSE AURORE',
    de: 'AURORAGRABEN',
    pt: 'TRINCHEIRA AURORA',
    it: 'FOSSA AURORA',
  },
  'species.trait.pip': {
    en: 'Loves to weave through sea anemones.',
    es: 'Le encanta tejer entre anémonas de mar.',
    fr: 'Adore se faufiler dans les anémones de mer.',
    de: 'Liebt es, durch Seeanemonen zu huschen.',
    pt: 'Adora serpentear entre anêmonas do mar.',
    it: 'Adora intrufolarsi tra gli anemoni di mare.',
  },
  'species.trait.marina': {
    en: 'Navigates the open coral lagoons with grace.',
    es: 'Navega por las lagunas de coral con gracia.',
    fr: 'Navigue dans les lagunes de corail avec grâce.',
    de: 'Navigiert anmutig durch offene Korallenlagunen.',
    pt: 'Navega pelas lagoas de coral com graça.',
    it: 'Naviga nelle lagune coralline con grazia.',
  },
  'species.trait.dot': {
    en: 'Puffs up when startled, but is mostly friendly.',
    es: 'Se infla al asustarse, pero es muy amigable.',
    fr: 'Se gonfle de peur, mais reste très amicale.',
    de: 'Bläht sich bei Schreck auf, ist aber meist friedlich.',
    pt: 'Infla quando se assusta, mas é muito amigável.',
    it: 'Si gonfia quando si spaventa, ma è amichevole.',
  },
  'species.trait.bumble': {
    en: 'Zips around active reefs like a busy bee.',
    es: 'Zumba por los arrecifes activos como una abeja.',
    fr: 'Vrombit autour des récifs actifs comme une abeille.',
    de: 'Saust wie eine Hummel um aktive Riffe herum.',
    pt: 'Zune pelos recifes ativos como uma abelha.',
    it: 'Sfreccia tra le barriere coralline come un\'ape.',
  },
  'species.trait.sol': {
    en: 'Radiates warmth and brightens up the shallow waters.',
    es: 'Irradia calidez y alegra las aguas poco profundas.',
    fr: 'Rayonne de chaleur et illumine les eaux peu profondes.',
    de: 'Strahlt Wärme aus und erhellt die flachen Gewässer.',
    pt: 'Irradia calor e ilumina as águas rasas.',
    it: 'Irradia calore e illumina le acque poco profonde.',
  },
  'species.trait.lumi': {
    en: 'Glows gently to guide lost schools in the deep night.',
    es: 'Brilla suavemente para guiar bancos de peces perdidos.',
    fr: 'Brille doucement pour guider les bancs égarés.',
    de: 'Leuchtet sanft, um verirrte Schwärme zu führen.',
    pt: 'Brilha suavemente para guiar cardumes perdidos.',
    it: 'Brilla dolcemente per guidare i banchi smarriti.',
  },
  'species.trait.nox': {
    en: 'Glides like a phantom through the shadowy reefs.',
    es: 'Se desliza como un fantasma por arrecifes sombríos.',
    fr: 'Glisse comme un fantôme à travers les récifs sombres.',
    de: 'Gleitet wie ein Phantom durch schattige Riffe.',
    pt: 'Desliza como um fantasma por recifes sombrios.',
    it: 'Scivola come un fantasma tra le barriere d\'ombra.',
  },
  'species.trait.glimmer': {
    en: 'A shimmering beauty that reflects the moonlight.',
    es: 'Una belleza brillante que refleja la luz de la luna.',
    fr: 'Une beauté scintillante qui reflète la lune.',
    de: 'Eine schimmernde Schönheit, die das Mondlicht reflektiert.',
    pt: 'Uma beleza cintilante que reflete a luz da lua.',
    it: 'Una bellezza scintillante che riflette la luna.',
  },
  'species.trait.veil': {
    en: 'Ethereal fins that wave like silk in midnight currents.',
    es: 'Aletas etéreas que ondean como seda en corrientes.',
    fr: 'Nageoires éthérées ondulant comme de la soie.',
    de: 'Ätherische Flossen, die wie Seide im Strom wehen.',
    pt: 'Barbatanas etéreas que ondulam como seda na corrente.',
    it: 'Pinne eteree che ondeggiano come seta nelle correnti.',
  },
  'species.trait.aurora': {
    en: 'Regal ruler of the deepest oceanic trenches.',
    es: 'Gobernante regio de las fosas oceánicas más profundas.',
    fr: 'Souverain majestueux des fosses océaniques.',
    de: 'Königlicher Herrscher der tiefsten Meeresgräben.',
    pt: 'Regente majestoso das fossas oceânicas mais profundas.',
    it: 'Regale sovrano delle più profonde fosse oceaniche.',
  },
};

export const TRANSLATIONS: Record<string, string> = {
  'hud.sandbox': 'SANDBOX',
  'hud.lvl': 'LV',
  'hud.mode': 'MODE',
  'hud.shop': 'SHOP',
  'hud.time': 'TIME:',
  'hud.final': 'FINAL:',
  'menu.levels': 'LEVELS',
  'menu.hatchEgg': 'HATCH THE EGG',
  'menu.sandbox': 'SANDBOX MODE',
  'pause.resume': 'RESUME',
  'pause.restart': 'RESTART LEVEL',
  'pause.mainMenu': 'MAIN MENU',
  'pause.sandboxOptions': 'SANDBOX OPTIONS',
  'pause.resetTank': 'RESET TANK',
  'shop.free': 'FREE',
};

export function t(key: string, lang?: Language): string {
  const targetLang = lang || activeLanguage;
  if (MULTI_TRANSLATIONS[key]) {
    return MULTI_TRANSLATIONS[key][targetLang] || MULTI_TRANSLATIONS[key]['en'];
  }
  if (MULTI_TRANSLATIONS_PART2[key]) {
    return MULTI_TRANSLATIONS_PART2[key][targetLang] || MULTI_TRANSLATIONS_PART2[key]['en'];
  }
  if (TRANSLATIONS[key]) return TRANSLATIONS[key];
  const parts = key.split('.');
  return parts[parts.length - 1].toUpperCase();
}

export const TEXT = {
  LEVEL_MODE: 'ADVENTURE MODE',
  SANDBOX_MODE: 'SANDBOX MODE',
  SETTINGS: 'SETTINGS',
  PAUSED: 'PAUSED',
  RESUME: 'RESUME',
  RESTART: 'RESTART',
  NEXT_LEVEL: 'NEXT LEVEL',
  GAME_OVER: 'GAME OVER',
  ALL_FISH_LOST: 'ALL FISH LOST',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT FUNDS TO REPLENISH TANK',
  MUSIC: 'MUSIC',
  SFX: 'SFX',
  SCREEN_SHAKE: 'SCREEN SHAKE',
  ON: 'ON',
  OFF: 'OFF',
  ROTATE_DEVICE: 'ROTATE DEVICE',
  SHOP: 'SHOP',
  LVL: 'LVL',
  MODE: 'MODE',
  SANDBOX: 'SANDBOX',
  TIME: 'TIME:',
  FINAL: 'FINAL:',
  RETRY: 'RETRY LEVEL',
  ALERT: '!ALERT!',
  HATCHING: 'HATCHING MYSTIC EGG...',
  PETS: 'Pets',
  UPGRADES: 'Upgrades',
  DECOR: 'Decor',
  EGG: 'Egg',
};

export const FONT_5X7: Record<string, string[]> = {
  'A': [
    '.XXX.',
    'X...X',
    'X...X',
    'XXXXX',
    'X...X',
    'X...X',
    'X...X'
  ],
  'B': [
    'XXXX.',
    'X...X',
    'XXXX.',
    'X...X',
    'X...X',
    'X...X',
    'XXXX.'
  ],
  'C': [
    '.XXXX',
    'X...X',
    'X....',
    'X....',
    'X....',
    'X...X',
    '.XXXX'
  ],
  'D': [
    'XXXX.',
    'X...X',
    'X...X',
    'X...X',
    'X...X',
    'X...X',
    'XXXX.'
  ],
  'E': [
    'XXXXX',
    'X....',
    'X....',
    'XXXX.',
    'X....',
    'X....',
    'XXXXX'
  ],
  'F': [
    'XXXXX',
    'X....',
    'X....',
    'XXXX.',
    'X....',
    'X....',
    'X....'
  ],
  'G': [
    '.XXXX',
    'X...X',
    'X....',
    'X.XXX',
    'X...X',
    'X...X',
    '.XXXX'
  ],
  'H': [
    'X...X',
    'X...X',
    'X...X',
    'XXXXX',
    'X...X',
    'X...X',
    'X...X'
  ],
  'I': [
    'XXXXX',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    'XXXXX'
  ],
  'J': [
    'XXXXX',
    '....X',
    '....X',
    '....X',
    'X...X',
    'X...X',
    '.XXX.'
  ],
  'K': [
    'X...X',
    'X..X.',
    'X.X..',
    'XX...',
    'X.X..',
    'X..X.',
    'X...X'
  ],
  'L': [
    'X....',
    'X....',
    'X....',
    'X....',
    'X....',
    'X....',
    'XXXXX'
  ],
  'M': [
    'X...X',
    'XX.XX',
    'X.X.X',
    'X...X',
    'X...X',
    'X...X',
    'X...X'
  ],
  'N': [
    'X...X',
    'XX..X',
    'X.X.X',
    'X..XX',
    'X...X',
    'X...X',
    'X...X'
  ],
  'O': [
    '.XXX.',
    'X...X',
    'X...X',
    'X...X',
    'X...X',
    'X...X',
    '.XXX.'
  ],
  'P': [
    'XXXX.',
    'X...X',
    'X...X',
    'XXXX.',
    'X....',
    'X....',
    'X....'
  ],
  'Q': [
    '.XXX.',
    'X...X',
    'X...X',
    'X...X',
    'X.X.X',
    'X..X.',
    '.XX.X'
  ],
  'R': [
    'XXXX.',
    'X...X',
    'X...X',
    'XXXX.',
    'X.X..',
    'X..X.',
    'X...X'
  ],
  'S': [
    '.XXXX',
    'X....',
    'X....',
    '.XXX.',
    '....X',
    '....X',
    'XXXX.'
  ],
  'T': [
    'XXXXX',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..'
  ],
  'U': [
    'X...X',
    'X...X',
    'X...X',
    'X...X',
    'X...X',
    'X...X',
    '.XXX.'
  ],
  'V': [
    'X...X',
    'X...X',
    'X...X',
    'X...X',
    'X...X',
    '.X.X.',
    '..X..'
  ],
  'W': [
    'X...X',
    'X...X',
    'X...X',
    'X.X.X',
    'X.X.X',
    'XX.XX',
    'X...X'
  ],
  'X': [
    'X...X',
    'X...X',
    '.X.X.',
    '..X..',
    '.X.X.',
    'X...X',
    'X...X'
  ],
  'Y': [
    'X...X',
    'X...X',
    '.X.X.',
    '..X..',
    '..X..',
    '..X..',
    '..X..'
  ],
  'Z': [
    'XXXXX',
    '....X',
    '...X.',
    '..X..',
    '.X...',
    'X....',
    'XXXXX'
  ],
  '0': [
    '.XXX.',
    'X...X',
    'X..XX',
    'X.X.X',
    'XX..X',
    'X...X',
    '.XXX.'
  ],
  '1': [
    '..X..',
    '.XX..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    'XXXXX'
  ],
  '2': [
    '.XXX.',
    'X...X',
    '....X',
    '..XX.',
    '.X...',
    'X....',
    'XXXXX'
  ],
  '3': [
    'XXXXX',
    '....X',
    '...X.',
    '..XX.',
    '....X',
    'X...X',
    '.XXX.'
  ],
  '4': [
    '...X.',
    '..XX.',
    '.X.X.',
    'X..X.',
    'XXXXX',
    '...X.',
    '...X.'
  ],
  '5': [
    'XXXXX',
    'X....',
    'XXXX.',
    '....X',
    '....X',
    'X...X',
    '.XXX.'
  ],
  '6': [
    '.XXX.',
    'X....',
    'X....',
    'XXXX.',
    'X...X',
    'X...X',
    '.XXX.'
  ],
  '7': [
    'XXXXX',
    '....X',
    '...X.',
    '..X..',
    '.X...',
    '.X...',
    '.X...'
  ],
  '8': [
    '.XXX.',
    'X...X',
    'X...X',
    '.XXX.',
    'X...X',
    'X...X',
    '.XXX.'
  ],
  '9': [
    '.XXX.',
    'X...X',
    'X...X',
    '.XXXX',
    '....X',
    '....X',
    '.XXX.'
  ],
  '+': [
    '.....',
    '..X..',
    '..X..',
    'XXXXX',
    '..X..',
    '..X..',
    '.....'
  ],
  '-': [
    '.....',
    '.....',
    '.....',
    'XXXXX',
    '.....',
    '.....',
    '.....'
  ],
  ':': [
    '.....',
    '..X..',
    '..X..',
    '.....',
    '..X..',
    '..X..',
    '.....'
  ],
  '/': [
    '....X',
    '...X.',
    '...X.',
    '..X..',
    '.X...',
    '.X...',
    'X....'
  ],
  '.': [
    '.....',
    '.....',
    '.....',
    '.....',
    '.....',
    '.XX..',
    '.XX..'
  ],
  'x': [
    '.....',
    '.....',
    'X...X',
    '.X.X.',
    '..X..',
    '.X.X.',
    'X...X'
  ],
  '!': [
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '.....',
    '..X..'
  ],
  '?': [
    '.XXX.',
    'X...X',
    '....X',
    '..XX.',
    '..X..',
    '.....',
    '..X..'
  ],
  '>': [
    'X....',
    '.X...',
    '..X..',
    '...X.',
    '..X..',
    '.X...',
    'X....'
  ],
  '<': [
    '....X',
    '...X.',
    '..X..',
    '.X...',
    '..X..',
    '...X.',
    '....X'
  ],
  '$': [
    '..X..',
    '.XXXX',
    'X.X..',
    '.XXX.',
    '..X.X',
    'XXXX.',
    '..X..'
  ],
  '(': [
    '..XX.',
    '.X...',
    'X....',
    'X....',
    'X....',
    '.X...',
    '..XX.'
  ],
  ')': [
    '.XX..',
    '...X.',
    '....X',
    '....X',
    '....X',
    '...X.',
    '.XX..'
  ],
  '%': [
    'XX..X',
    'XX.X.',
    '..X..',
    '.X...',
    '.X.XX',
    'X..XX',
    '.....'
  ],
  ',': [
    '.....',
    '.....',
    '.....',
    '.....',
    '..X..',
    '..X..',
    '.X...'
  ],
  "'": [
    '..X..',
    '..X..',
    '.X...',
    '.....',
    '.....',
    '.....',
    '.....'
  ],
  ' ': [
    '.....',
    '.....',
    '.....',
    '.....',
    '.....',
    '.....',
    '.....'
  ],
};

export const FONT_3X5: Record<string, string[]> = {
  'A': ['XXX', 'X.X', 'XXX', 'X.X', 'X.X'],
  'B': ['XX.', 'X.X', 'XX.', 'X.X', 'XX.'],
  'C': ['XXX', 'X..', 'X..', 'X..', 'XXX'],
  'D': ['XX.', 'X.X', 'X.X', 'X.X', 'XX.'],
  'E': ['XXX', 'X..', 'XXX', 'X..', 'XXX'],
  'F': ['XXX', 'X..', 'XX.', 'X..', 'X..'],
  'G': ['XXX', 'X..', 'X.X', 'X.X', 'XXX'],
  'H': ['X.X', 'X.X', 'XXX', 'X.X', 'X.X'],
  'I': ['XXX', '.X.', '.X.', '.X.', 'XXX'],
  'J': ['..X', '..X', '..X', 'X.X', 'XXX'],
  'K': ['X.X', 'X.X', 'XX.', 'X.X', 'X.X'],
  'L': ['X..', 'X..', 'X..', 'X..', 'XXX'],
  'M': ['X.X', 'XXX', 'X.X', 'X.X', 'X.X'],
  'N': ['XXX', 'X.X', 'X.X', 'X.X', 'X.X'],
  'O': ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'],
  'P': ['XXX', 'X.X', 'XXX', 'X..', 'X..'],
  'Q': ['XXX', 'X.X', 'X.X', 'XX.', '..X'],
  'R': ['XXX', 'X.X', 'XX.', 'X.X', 'X.X'],
  'S': ['XXX', 'X..', 'XXX', '..X', 'XXX'],
  'T': ['XXX', '.X.', '.X.', '.X.', '.X.'],
  'U': ['X.X', 'X.X', 'X.X', 'X.X', 'XXX'],
  'V': ['X.X', 'X.X', 'X.X', 'X.X', '.X.'],
  'W': ['X.X', 'X.X', 'X.X', 'XXX', 'X.X'],
  'X': ['X.X', 'X.X', '.X.', 'X.X', 'X.X'],
  'Y': ['X.X', 'X.X', 'XXX', '..X', 'XXX'],
  'Z': ['XXX', '..X', '.X.', 'X..', 'XXX'],
  '0': ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'],
  '1': ['.X.', 'XX.', '.X.', '.X.', 'XXX'],
  '2': ['XXX', '..X', 'XXX', 'X..', 'XXX'],
  '3': ['XXX', '..X', 'XXX', '..X', 'XXX'],
  '4': ['X.X', 'X.X', 'XXX', '..X', '..X'],
  '5': ['XXX', 'X..', 'XXX', '..X', 'XXX'],
  '6': ['XXX', 'X..', 'XXX', 'X.X', 'XXX'],
  '7': ['XXX', '..X', '..X', '.X.', '.X.'],
  '8': ['XXX', 'X.X', 'XXX', 'X.X', 'XXX'],
  '9': ['XXX', 'X.X', 'XXX', '..X', 'XXX'],
  '+': ['...', '.X.', 'XXX', '.X.', '...'],
  '-': ['...', '...', 'XXX', '...', '...'],
  ':': ['...', '.X.', '...', '.X.', '...'],
  '/': ['..X', '..X', '.X.', 'X..', 'X..'],
  '.': ['...', '...', '...', '...', '.X.'],
  'x': ['X.X', 'X.X', '.X.', 'X.X', 'X.X'],
  '!': ['.X.', '.X.', '.X.', '...', '.X.'],
  '?': ['XXX', '..X', '.X.', '...', '.X.'],
  '>': ['X..', '.X.', '..X', '.X.', 'X..'],
  '<': ['..X', '.X.', 'X..', '.X.', '..X'],
  '(': ['.XX', 'X..', 'X..', 'X..', '.XX'],
  ')': ['XX.', '..X', '..X', '..X', 'XX.'],
  ',': ['...', '...', '...', '.X.', 'X..'],
  "'": ['.X.', '.X.', '...', '...', '...'],
  '%': ['X.X', '..X', '.X.', 'X..', 'X.X'],
  '$': ['.X.', 'XXX', 'X..', 'XXX', '..X'],
  ' ': ['...', '...', '...', '...', '...'],
};

export type FontTier = 'normal' | 'small';

// Helper to look up glyph safely, mapping lowercase to uppercase and falling back to "?"
export function getGlyph(ch: string, font: FontTier): string[] {
  const fontMap = font === 'small' ? FONT_3X5 : FONT_5X7;
  const upper = ch.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (fontMap[upper]) return fontMap[upper];
  if (fontMap[ch]) return fontMap[ch];
  if (fontMap['?']) return fontMap['?'];
  return font === 'small' ? FONT_3X5[' '] : FONT_5X7[' '];
}

// ============================================================================
// 1. MEASURE
// Normal: 6 advance, 9 line height
// Small: 4 advance, 6 line height
// ============================================================================

export function measure(text: string, font: FontTier): { width: number; height: number } {
  const advance = font === 'small' ? 4 : 6;
  const lineHeight = font === 'small' ? 6 : 9;

  const lines = text.split('\n');
  let maxLen = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length > maxLen) maxLen = lines[i].length;
  }

  return {
    width: maxLen * advance,
    height: Math.max(1, lines.length) * lineHeight,
  };
}

export function measureMiniBitmapText(text: string): number {
  return text.length * 4;
}

// ============================================================================
// 2. WRAP
// Breaks on spaces and hard-breaks over-long words with a trailing "-"
// ============================================================================

export function wrap(text: string, maxW: number, font: FontTier): string[] {
  const advance = font === 'small' ? 4 : 6;
  const charLimit = Math.max(1, Math.floor(maxW / advance));

  const paragraphs = text.split('\n');
  const resultLines: string[] = [];

  for (let p = 0; p < paragraphs.length; p++) {
    const paragraph = paragraphs[p];
    if (!paragraph) {
      resultLines.push('');
      continue;
    }

    const words = paragraph.split(' ');
    const processedWords: string[] = [];

    // Break words that exceed charLimit
    for (let w = 0; w < words.length; w++) {
      const word = words[w];
      if (word.length <= charLimit) {
        processedWords.push(word);
      } else {
        // Hard-break over-long words with a trailing "-"
        const chunkSize = charLimit > 1 ? charLimit - 1 : 1;
        let pos = 0;
        while (pos < word.length) {
          const isLast = pos + chunkSize >= word.length;
          if (isLast) {
            processedWords.push(word.slice(pos));
            pos += chunkSize;
          } else {
            processedWords.push(word.slice(pos, pos + chunkSize) + (charLimit > 1 ? '-' : ''));
            pos += chunkSize;
          }
        }
      }
    }

    // Line wrap processed words
    let currentLine = '';
    for (let i = 0; i < processedWords.length; i++) {
      const word = processedWords[i];
      if (!currentLine) {
        currentLine = word;
      } else {
        if ((currentLine + ' ' + word).length <= charLimit) {
          currentLine += ' ' + word;
        } else {
          resultLines.push(currentLine);
          currentLine = word;
        }
      }
    }
    if (currentLine) {
      resultLines.push(currentLine);
    }
  }

  return resultLines;
}

// ============================================================================
// 3. FIT TEXT & CACHING
// Tries normal, then small, then truncates the last line with "..."
// Cache Map capped at 300 entries with oldest evicted
// ============================================================================

export interface FitTextOptions {
  w: number;
  h: number;
  maxLines?: number;
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  fonts?: FontTier[];
}

export interface FitTextResult {
  lines: string[];
  font: FontTier;
  truncated: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

const FIT_TEXT_CACHE_MAX = 300;
const fitTextCache = new Map<string, FitTextResult>();

export function fitText(text: string, options: FitTextOptions): FitTextResult {
  const fontList = options.fonts || ['normal', 'small'];
  const align = options.align || 'left';
  const valign = options.valign || 'top';
  const maxLines = options.maxLines ?? Infinity;

  const cacheKey = `${text}|${fontList.join(',')}|${options.w}x${options.h}|${maxLines}|${align}|${valign}`;

  if (fitTextCache.has(cacheKey)) {
    const val = fitTextCache.get(cacheKey)!;
    fitTextCache.delete(cacheKey);
    fitTextCache.set(cacheKey, val); // Move to end (most recent)
    return val;
  }

  let selectedFont: FontTier = fontList[fontList.length - 1];
  let finalLines: string[] = [];
  let isTruncated = false;

  // 1. Try fonts in order to see if one fits without truncation
  for (let f = 0; f < fontList.length; f++) {
    const font = fontList[f];
    const lineHeight = font === 'small' ? 6 : 9;
    const wrapped = wrap(text, options.w, font);
    const totalH = wrapped.length * lineHeight;

    if (wrapped.length <= maxLines && totalH <= options.h) {
      selectedFont = font;
      finalLines = wrapped;
      isTruncated = false;
      break;
    }
  }

  // 2. If no font fit, use last allowed font and truncate
  if (finalLines.length === 0) {
    selectedFont = fontList[fontList.length - 1];
    const lineHeight = selectedFont === 'small' ? 6 : 9;
    const advance = selectedFont === 'small' ? 4 : 6;
    const maxAllowedLines = Math.min(maxLines, Math.max(1, Math.floor(options.h / lineHeight)));
    const wrapped = wrap(text, options.w, selectedFont);

    if (wrapped.length > maxAllowedLines) {
      finalLines = wrapped.slice(0, maxAllowedLines);
      const charLimit = Math.max(1, Math.floor(options.w / advance));
      let lastLine = finalLines[maxAllowedLines - 1];

      if (lastLine.length + 3 > charLimit) {
        lastLine = lastLine.slice(0, Math.max(0, charLimit - 3)) + '...';
      } else {
        lastLine = lastLine + '...';
      }
      finalLines[maxAllowedLines - 1] = lastLine;
      isTruncated = true;
    } else {
      finalLines = wrapped;
      isTruncated = false;
    }
  }

  const advance = selectedFont === 'small' ? 4 : 6;
  const lineHeight = selectedFont === 'small' ? 6 : 9;
  const totalHeight = finalLines.length * lineHeight;

  let maxLineLen = 0;
  for (let i = 0; i < finalLines.length; i++) {
    if (finalLines[i].length > maxLineLen) maxLineLen = finalLines[i].length;
  }
  const totalWidth = maxLineLen * advance;

  // Snapped to whole art pixels
  let x = 0;
  if (align === 'center') x = Math.floor(options.w / 2);
  else if (align === 'right') x = options.w;

  let y = 0;
  if (valign === 'middle') y = Math.floor((options.h - totalHeight) / 2);
  else if (valign === 'bottom') y = options.h - totalHeight;

  const result: FitTextResult = {
    lines: finalLines,
    font: selectedFont,
    truncated: isTruncated,
    x,
    y,
    width: totalWidth,
    height: totalHeight,
  };

  // Cache eviction (oldest evicted)
  if (fitTextCache.size >= FIT_TEXT_CACHE_MAX) {
    const oldestKey = fitTextCache.keys().next().value;
    if (oldestKey !== undefined) fitTextCache.delete(oldestKey);
  }
  fitTextCache.set(cacheKey, result);


  return result;
}

/**
 * Calculates the group font tier for a list of labels in the same slot budget.
 * Returns the smallest font tier ('small') if any member needs it, otherwise 'normal'.
 */
export function getGroupFontTier(
  labels: string[],
  options: FitTextOptions
): FontTier {
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    if (!label) continue;
    const testResult = fitText(label, { ...options, fonts: ['normal'] });
    if (testResult.font === 'small' || testResult.truncated) {
      return 'small';
    }
  }
  return 'normal';
}

// ============================================================================
// 4. FORMAT NUMBER
// Prints integers in full when they fit, otherwise as 12.3K or 1.2M
// ============================================================================

export function formatNumber(n: number, maxW?: number, font: FontTier = 'normal'): string {
  if (!isFinite(n) || isNaN(n)) return '0';
  const rounded = Math.floor(n);
  const fullStr = rounded.toString();
  const advance = font === 'small' ? 4 : 6;

  if (maxW !== undefined && fullStr.length * advance <= maxW) {
    return fullStr;
  }

  function fmt(val: number, div: number, suffix: string): string {
    const v = val / div;
    let s = v.toFixed(1);
    if (s.endsWith('.0')) s = s.slice(0, -2);
    return s + suffix;
  }

  if (rounded >= 1_000_000_000) {
    return fmt(rounded, 1_000_000_000, 'B');
  }
  if (rounded >= 1_000_000) {
    return fmt(rounded, 1_000_000, 'M');
  }
  if (rounded >= 1_000) {
    return fmt(rounded, 1_000, 'K');
  }

  return fullStr;
}

// ============================================================================
// 5. UNIFIED DRAWING FUNCTIONS
// ============================================================================

export interface DrawTextOptions {
  font?: FontTier;
  color?: PaletteKey | string;
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  scale?: number;
  ditherStep?: number;
  withShadow?: boolean;
  shadowColor?: PaletteKey | string;
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: DrawTextOptions = {}
) {
  const font = options.font || 'normal';
  const color = options.color || 'cream';
  const align = options.align || 'left';
  const scale = options.scale || 1;
  const ditherStep = options.ditherStep || 0;
  const withShadow = options.withShadow ?? false;

  if (ditherStep >= 4) return;

  const lines = text.split('\n');
  const advance = (font === 'small' ? 4 : 6) * scale;
  const lineHeight = (font === 'small' ? 6 : 9) * scale;
  const glyphW = font === 'small' ? 3 : 5;
  const glyphH = font === 'small' ? 5 : 7;

  const fillHex = (color in PALETTE) ? PALETTE[color as PaletteKey] : color;
  const shadowHex = options.shadowColor
    ? ((options.shadowColor in PALETTE) ? PALETTE[options.shadowColor as PaletteKey] : options.shadowColor)
    : PALETTE.outline;

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l];
    const totalW = line.length * advance;
    let lx = Math.floor(x);
    if (align === 'center') lx = Math.floor(x - totalW / 2);
    else if (align === 'right') lx = Math.floor(x - totalW);
    const ly = Math.floor(y + l * lineHeight);

    // Drop shadow pass
    if (withShadow) {
      ctx.fillStyle = shadowHex;
      let cx = lx + 1;
      for (let i = 0; i < line.length; i++) {
        const glyph = getGlyph(line[i], font);
        for (let r = 0; r < glyphH; r++) {
          const row = glyph[r];
          for (let c = 0; c < glyphW; c++) {
            if (row[c] === 'X') {
              ctx.fillRect(cx + c * scale, ly + r * scale + 1, scale, scale);
            }
          }
        }
        cx += advance;
      }
    }

    // Main glyph pass
    ctx.fillStyle = fillHex;
    let cx = lx;
    for (let i = 0; i < line.length; i++) {
      const glyph = getGlyph(line[i], font);
      for (let r = 0; r < glyphH; r++) {
        const row = glyph[r];
        for (let c = 0; c < glyphW; c++) {
          if (row[c] === 'X') {
            const px = cx + c * scale;
            const py = ly + r * scale;

            if (ditherStep === 1 && (px % 2 === 0 && py % 2 === 0)) continue;
            if (ditherStep === 2 && ((px + py) % 2 === 0)) continue;
            if (ditherStep === 3 && !(px % 2 === 1 && py % 2 === 1)) continue;

            ctx.fillRect(px, py, scale, scale);
          }
        }
      }
      cx += advance;
    }
  }
}

export function drawBitmapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: PaletteKey = 'cream',
  align: 'left' | 'center' | 'right' = 'left',
  scale: number = 1,
  ditherStep: number = 0
) {
  drawText(ctx, text, x, y, {
    font: 'normal',
    color,
    align,
    scale,
    ditherStep,
    withShadow: true,
  });
}

export function drawMiniBitmapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: PaletteKey = 'cream',
  align: 'left' | 'center' | 'right' = 'left',
  withShadow: boolean = false
) {
  drawText(ctx, text, x, y, {
    font: 'small',
    color,
    align,
    scale: 1,
    withShadow,
  });
}

export function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  boxX: number,
  boxY: number,
  options: FitTextOptions & DrawTextOptions
): FitTextResult {
  const fitted = fitText(text, options);
  drawText(ctx, fitted.lines.join('\n'), boxX + fitted.x, boxY + fitted.y, {
    ...options,
    font: fitted.font,
  });
  return fitted;
}

let activeAuditWarnings: string[] | null = null;

export function setActiveAuditWarnings(arr: string[] | null) {
  activeAuditWarnings = arr;
}

export function drawTextWithClip(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  clipX: number,
  clipY: number,
  clipW: number,
  clipH: number,
  options: DrawTextOptions = {}
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(clipX, clipY, clipW, clipH);
  ctx.clip();

  const font = options.font || 'normal';
  const m = measure(text, font);
  if (x < clipX || y < clipY || x + m.width > clipX + clipW || y + m.height > clipY + clipH) {
    const w = `[TEXT CLIP WARN] Text "${text}" (${m.width}x${m.height}) clipped by box (${clipX}, ${clipY}, ${clipW}, ${clipH})`;
    if (activeAuditWarnings) {
      activeAuditWarnings.push(w);
    }
    console.warn(w);
  }

  if (text.includes('...') || text.includes('…')) {
    const w = `[TEXT ELLIPSIS WARN] Ellipsis is banned in account UI: "${text}"`;
    if (activeAuditWarnings) {
      activeAuditWarnings.push(w);
    }
    console.warn(w);
  }

  drawText(ctx, text, x, y, options);
  ctx.restore();
}
