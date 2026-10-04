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

export function t(key: string): string {
  if (MULTI_TRANSLATIONS[key]) {
    return MULTI_TRANSLATIONS[key][activeLanguage] || MULTI_TRANSLATIONS[key]['en'];
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
  const upper = ch.toUpperCase();
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
