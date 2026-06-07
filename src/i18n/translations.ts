export const LANGS = ['ja', 'en', 'zh', 'ko', 'es', 'fr', 'pt', 'de'] as const
export type Lang = (typeof LANGS)[number]

/** 言語選択メニューの表示名（その言語自身の表記） */
export const LANG_LABELS: Record<Lang, string> = {
  ja: '日本語',
  en: 'English',
  zh: '中文',
  ko: '한국어',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  de: 'Deutsch'
}

/** 日付・時刻整形用の BCP47 ロケール */
export const LANG_LOCALE: Record<Lang, string> = {
  ja: 'ja-JP',
  en: 'en-US',
  zh: 'zh-CN',
  ko: 'ko-KR',
  es: 'es-ES',
  fr: 'fr-FR',
  pt: 'pt-BR',
  de: 'de-DE'
}

export type TKey =
  | 'appName'
  | 'tagline'
  | 'modeLocal'
  | 'tab_bottle'
  | 'tab_window'
  | 'window_today'
  | 'window_loading'
  | 'window_empty1'
  | 'window_empty2'
  | 'fab_aria'
  | 'toast_postedDelivered'
  | 'toast_posted'
  | 'toast_alreadyPosted'
  | 'toast_replyPhoto'
  | 'toast_reaction'
  | 'toast_reportDone'
  | 'toast_loadError'
  | 'toast_replyFail'
  | 'camera_titlePost'
  | 'camera_titleReply'
  | 'camera_submitPost'
  | 'camera_submitReply'
  | 'camera_shutter'
  | 'camera_close'
  | 'camera_retake'
  | 'camera_sending'
  | 'camera_placeholder'
  | 'camera_noWords'
  | 'camera_error'
  | 'camera_failed'
  | 'post_report'
  | 'post_reported'
  | 'post_reportPrompt'
  | 'post_reportDefault'
  | 'bottle_lead'
  | 'bottle_shoot'
  | 'bottle_note'
  | 'bottle_loading'
  | 'bottle_arrived'
  | 'bottle_replyIntro'
  | 'bottle_replyPhoto'
  | 'bottle_replyReaction'
  | 'bottle_back'
  | 'bottle_yourReply'
  | 'bottle_closed'
  | 'reaction_thanks'
  | 'reaction_lovely'
  | 'reaction_smile'
  | 'reaction_genki'
  | 'language'

type Dict = Record<TKey, string>

const ja: Dict = {
  appName: '世界の窓',
  tagline: '今日の地球を、そっと覗くアプリ',
  modeLocal: 'ローカル・デモモード',
  tab_bottle: '漂流瓶',
  tab_window: '世界の窓',
  window_today: '今日の世界',
  window_loading: '今日の景色を読み込んでいます…',
  window_empty1: 'まだ今日の投稿はありません。',
  window_empty2: '世界のどこかで、最初の1枚を待っています。',
  fab_aria: '撮影する',
  toast_postedDelivered: '世界に届きました。誰かにも届いています。',
  toast_posted: '世界に届きました。',
  toast_alreadyPosted: '今日はもう投稿しました。また明日。',
  toast_replyPhoto: '写真で返事を届けました',
  toast_reaction: '気持ちを届けました',
  toast_reportDone: '通報を受け付けました。表示を停止します。',
  toast_loadError: '読み込みに失敗しました',
  toast_replyFail: '返事できませんでした',
  camera_titlePost: '今この瞬間を撮る',
  camera_titleReply: '写真で返事する',
  camera_submitPost: '世界に流す',
  camera_submitReply: '返事を流す',
  camera_shutter: '撮影',
  camera_close: 'とじる',
  camera_retake: '撮り直す',
  camera_sending: '送信中…',
  camera_placeholder: 'ひとこと（50文字まで）',
  camera_noWords: '漂流瓶への返信に言葉は添えられません。写真だけを返します。',
  camera_error:
    'カメラを起動できませんでした。このアプリは端末のカメラ撮影のみに対応しています（画像アップロード不可）。ブラウザのカメラ権限を確認してください。',
  camera_failed: '送信できませんでした',
  post_report: '通報する',
  post_reported: '通報しました',
  post_reportPrompt: 'この投稿を通報します。理由を入力してください。',
  post_reportDefault: '不適切な画像',
  bottle_lead: '写真を送ると、世界の誰かに届きます。あなたにも1枚届きます。',
  bottle_shoot: '撮影して流す',
  bottle_note:
    '一度きりのやり取りです。相手を知ることはできません。でも、世界のどこかで同じ時間を生きている誰かを感じられます。',
  bottle_loading: '漂流瓶をさがしています…',
  bottle_arrived: '届きました',
  bottle_replyIntro:
    '1往復だけ返事ができます。写真か、気持ちのリアクションか、どちらか一つ。言葉は添えられません。',
  bottle_replyPhoto: '写真で返す',
  bottle_replyReaction: 'リアクションで返す',
  bottle_back: 'もどる',
  bottle_yourReply: 'あなたの返事',
  bottle_closed: 'この漂流瓶のやり取りは、これで終わりです。またいつか、別の誰かと。',
  reaction_thanks: 'ありがとう',
  reaction_lovely: 'すてき',
  reaction_smile: 'ほっとした',
  reaction_genki: 'げんき出た',
  language: '言語'
}

const en: Dict = {
  appName: 'Window to the World',
  tagline: 'A quiet look at today’s Earth.',
  modeLocal: 'Local demo mode',
  tab_bottle: 'Bottle',
  tab_window: 'World',
  window_today: 'Today’s world',
  window_loading: 'Loading today’s views…',
  window_empty1: 'No posts today yet.',
  window_empty2: 'Somewhere in the world, the first photo is awaited.',
  fab_aria: 'Take a photo',
  toast_postedDelivered: 'Shared with the world. It reached someone, too.',
  toast_posted: 'Shared with the world.',
  toast_alreadyPosted: 'You’ve already posted today. See you tomorrow.',
  toast_replyPhoto: 'Your photo reply was delivered.',
  toast_reaction: 'Your feeling was delivered.',
  toast_reportDone: 'Report received. This post will be hidden.',
  toast_loadError: 'Failed to load.',
  toast_replyFail: 'Could not reply.',
  camera_titlePost: 'Capture this moment',
  camera_titleReply: 'Reply with a photo',
  camera_submitPost: 'Send to the world',
  camera_submitReply: 'Send reply',
  camera_shutter: 'Shutter',
  camera_close: 'Close',
  camera_retake: 'Retake',
  camera_sending: 'Sending…',
  camera_placeholder: 'A few words (up to 50)',
  camera_noWords: 'No words can be added to a bottle reply. Only a photo is sent.',
  camera_error:
    'Could not start the camera. This app only supports photos taken with your device camera (no uploads). Please check the camera permission in your browser.',
  camera_failed: 'Could not send.',
  post_report: 'Report',
  post_reported: 'Reported',
  post_reportPrompt: 'Report this post. Please enter a reason.',
  post_reportDefault: 'Inappropriate image',
  bottle_lead:
    'Send a photo and it reaches someone in the world. One reaches you, too.',
  bottle_shoot: 'Take a photo & set it adrift',
  bottle_note:
    'A one-time exchange. You can’t know who they are. Still, you can feel someone living the same moment somewhere in the world.',
  bottle_loading: 'Looking for a bottle…',
  bottle_arrived: 'It arrived',
  bottle_replyIntro:
    'You may reply just once. A photo or a feeling — choose one. No words can be added.',
  bottle_replyPhoto: 'Reply with a photo',
  bottle_replyReaction: 'Reply with a reaction',
  bottle_back: 'Back',
  bottle_yourReply: 'Your reply',
  bottle_closed: 'This bottle exchange is now complete. Until next time, with someone new.',
  reaction_thanks: 'Thank you',
  reaction_lovely: 'Lovely',
  reaction_smile: 'Comforting',
  reaction_genki: 'Uplifting',
  language: 'Language'
}

const zh: Dict = {
  appName: '世界之窗',
  tagline: '静静地窥见今天的地球。',
  modeLocal: '本地演示模式',
  tab_bottle: '漂流瓶',
  tab_window: '世界',
  window_today: '今天的世界',
  window_loading: '正在加载今天的风景…',
  window_empty1: '今天还没有投稿。',
  window_empty2: '在世界的某个角落，正等待着第一张照片。',
  fab_aria: '拍照',
  toast_postedDelivered: '已分享给世界。也送到了某个人那里。',
  toast_posted: '已分享给世界。',
  toast_alreadyPosted: '今天已经投稿过了。明天见。',
  toast_replyPhoto: '已用照片回复。',
  toast_reaction: '已传达你的心意。',
  toast_reportDone: '已收到举报。该投稿将被隐藏。',
  toast_loadError: '加载失败。',
  toast_replyFail: '无法回复。',
  camera_titlePost: '记录此刻',
  camera_titleReply: '用照片回复',
  camera_submitPost: '分享给世界',
  camera_submitReply: '发送回复',
  camera_shutter: '快门',
  camera_close: '关闭',
  camera_retake: '重拍',
  camera_sending: '发送中…',
  camera_placeholder: '一句话（最多50字）',
  camera_noWords: '漂流瓶的回复不能附带文字，只发送照片。',
  camera_error:
    '无法启动相机。本应用仅支持用设备相机拍摄的照片（不可上传图片）。请检查浏览器的相机权限。',
  camera_failed: '发送失败。',
  post_report: '举报',
  post_reported: '已举报',
  post_reportPrompt: '举报此投稿。请输入理由。',
  post_reportDefault: '不当图片',
  bottle_lead: '发送照片，它会送到世界上的某个人手中。也会有一张送到你这里。',
  bottle_shoot: '拍照并放流',
  bottle_note:
    '只有一次的交流，无法得知对方是谁。但你能感受到，世界某处有人和你共度此刻。',
  bottle_loading: '正在寻找漂流瓶…',
  bottle_arrived: '收到了',
  bottle_replyIntro: '只能回复一次。照片或心情反应，二选一。不能附带文字。',
  bottle_replyPhoto: '用照片回复',
  bottle_replyReaction: '用反应回复',
  bottle_back: '返回',
  bottle_yourReply: '你的回复',
  bottle_closed: '这个漂流瓶的交流到此结束。下次，再与另一个人相遇。',
  reaction_thanks: '谢谢',
  reaction_lovely: '真美',
  reaction_smile: '安心了',
  reaction_genki: '有精神了',
  language: '语言'
}

const ko: Dict = {
  appName: '세계의 창',
  tagline: '오늘의 지구를 살며시 들여다보는 앱.',
  modeLocal: '로컬 데모 모드',
  tab_bottle: '유리병 편지',
  tab_window: '세계',
  window_today: '오늘의 세계',
  window_loading: '오늘의 풍경을 불러오는 중…',
  window_empty1: '아직 오늘의 게시물이 없습니다.',
  window_empty2: '세계 어딘가에서, 첫 번째 사진을 기다리고 있습니다.',
  fab_aria: '촬영하기',
  toast_postedDelivered: '세계에 전해졌습니다. 누군가에게도 닿았어요.',
  toast_posted: '세계에 전해졌습니다.',
  toast_alreadyPosted: '오늘은 이미 게시했어요. 내일 또 만나요.',
  toast_replyPhoto: '사진으로 답장을 보냈습니다.',
  toast_reaction: '마음을 전했습니다.',
  toast_reportDone: '신고를 접수했습니다. 이 게시물을 숨깁니다.',
  toast_loadError: '불러오지 못했습니다.',
  toast_replyFail: '답장할 수 없습니다.',
  camera_titlePost: '지금 이 순간을 담기',
  camera_titleReply: '사진으로 답장하기',
  camera_submitPost: '세계로 보내기',
  camera_submitReply: '답장 보내기',
  camera_shutter: '셔터',
  camera_close: '닫기',
  camera_retake: '다시 찍기',
  camera_sending: '보내는 중…',
  camera_placeholder: '한마디 (50자까지)',
  camera_noWords: '유리병 편지 답장에는 말을 덧붙일 수 없습니다. 사진만 보냅니다.',
  camera_error:
    '카메라를 시작할 수 없습니다. 이 앱은 기기 카메라 촬영만 지원합니다(이미지 업로드 불가). 브라우저의 카메라 권한을 확인하세요.',
  camera_failed: '보낼 수 없습니다.',
  post_report: '신고',
  post_reported: '신고했습니다',
  post_reportPrompt: '이 게시물을 신고합니다. 이유를 입력하세요.',
  post_reportDefault: '부적절한 이미지',
  bottle_lead: '사진을 보내면 세계의 누군가에게 닿습니다. 당신에게도 한 장 도착해요.',
  bottle_shoot: '촬영해서 띄워 보내기',
  bottle_note:
    '단 한 번의 교류입니다. 상대가 누구인지는 알 수 없어요. 그래도 세계 어딘가에서 같은 시간을 사는 누군가를 느낄 수 있습니다.',
  bottle_loading: '유리병 편지를 찾는 중…',
  bottle_arrived: '도착했습니다',
  bottle_replyIntro:
    '한 번만 답장할 수 있어요. 사진이나 마음의 리액션 중 하나만. 말은 덧붙일 수 없습니다.',
  bottle_replyPhoto: '사진으로 답장',
  bottle_replyReaction: '리액션으로 답장',
  bottle_back: '뒤로',
  bottle_yourReply: '당신의 답장',
  bottle_closed: '이 유리병 편지의 교류는 여기서 끝입니다. 언젠가 또, 다른 누군가와.',
  reaction_thanks: '고마워요',
  reaction_lovely: '멋져요',
  reaction_smile: '안심돼요',
  reaction_genki: '힘이 났어요',
  language: '언어'
}

const es: Dict = {
  appName: 'Ventana al Mundo',
  tagline: 'Una mirada serena a la Tierra de hoy.',
  modeLocal: 'Modo demo local',
  tab_bottle: 'Botella',
  tab_window: 'Mundo',
  window_today: 'El mundo de hoy',
  window_loading: 'Cargando las vistas de hoy…',
  window_empty1: 'Aún no hay publicaciones hoy.',
  window_empty2: 'En algún lugar del mundo, se espera la primera foto.',
  fab_aria: 'Tomar una foto',
  toast_postedDelivered: 'Compartido con el mundo. También llegó a alguien.',
  toast_posted: 'Compartido con el mundo.',
  toast_alreadyPosted: 'Ya publicaste hoy. Hasta mañana.',
  toast_replyPhoto: 'Tu respuesta con foto fue entregada.',
  toast_reaction: 'Tu sentimiento fue entregado.',
  toast_reportDone: 'Reporte recibido. Esta publicación se ocultará.',
  toast_loadError: 'Error al cargar.',
  toast_replyFail: 'No se pudo responder.',
  camera_titlePost: 'Captura este momento',
  camera_titleReply: 'Responder con una foto',
  camera_submitPost: 'Enviar al mundo',
  camera_submitReply: 'Enviar respuesta',
  camera_shutter: 'Disparador',
  camera_close: 'Cerrar',
  camera_retake: 'Repetir',
  camera_sending: 'Enviando…',
  camera_placeholder: 'Unas palabras (hasta 50)',
  camera_noWords: 'No se pueden añadir palabras a la respuesta de la botella. Solo se envía una foto.',
  camera_error:
    'No se pudo iniciar la cámara. Esta app solo admite fotos tomadas con la cámara del dispositivo (sin subir imágenes). Revisa el permiso de la cámara en tu navegador.',
  camera_failed: 'No se pudo enviar.',
  post_report: 'Reportar',
  post_reported: 'Reportado',
  post_reportPrompt: 'Reportar esta publicación. Indica el motivo.',
  post_reportDefault: 'Imagen inapropiada',
  bottle_lead: 'Envía una foto y llegará a alguien en el mundo. A ti también te llega una.',
  bottle_shoot: 'Toma una foto y déjala a la deriva',
  bottle_note:
    'Un intercambio único. No puedes saber quién es. Aun así, sientes a alguien viviendo el mismo momento en algún lugar del mundo.',
  bottle_loading: 'Buscando una botella…',
  bottle_arrived: 'Ha llegado',
  bottle_replyIntro:
    'Solo puedes responder una vez. Una foto o una reacción: elige una. No se pueden añadir palabras.',
  bottle_replyPhoto: 'Responder con foto',
  bottle_replyReaction: 'Responder con reacción',
  bottle_back: 'Atrás',
  bottle_yourReply: 'Tu respuesta',
  bottle_closed: 'Este intercambio de botella ha terminado. Hasta la próxima, con alguien nuevo.',
  reaction_thanks: 'Gracias',
  reaction_lovely: 'Precioso',
  reaction_smile: 'Reconfortante',
  reaction_genki: 'Me animó',
  language: 'Idioma'
}

const fr: Dict = {
  appName: 'Fenêtre sur le Monde',
  tagline: 'Un regard paisible sur la Terre d’aujourd’hui.',
  modeLocal: 'Mode démo local',
  tab_bottle: 'Bouteille',
  tab_window: 'Monde',
  window_today: 'Le monde aujourd’hui',
  window_loading: 'Chargement des vues du jour…',
  window_empty1: 'Aucune publication aujourd’hui.',
  window_empty2: 'Quelque part dans le monde, la première photo est attendue.',
  fab_aria: 'Prendre une photo',
  toast_postedDelivered: 'Partagé avec le monde. C’est aussi arrivé à quelqu’un.',
  toast_posted: 'Partagé avec le monde.',
  toast_alreadyPosted: 'Vous avez déjà publié aujourd’hui. À demain.',
  toast_replyPhoto: 'Votre réponse photo a été envoyée.',
  toast_reaction: 'Votre ressenti a été transmis.',
  toast_reportDone: 'Signalement reçu. Cette publication sera masquée.',
  toast_loadError: 'Échec du chargement.',
  toast_replyFail: 'Impossible de répondre.',
  camera_titlePost: 'Capturer cet instant',
  camera_titleReply: 'Répondre avec une photo',
  camera_submitPost: 'Envoyer au monde',
  camera_submitReply: 'Envoyer la réponse',
  camera_shutter: 'Déclencheur',
  camera_close: 'Fermer',
  camera_retake: 'Reprendre',
  camera_sending: 'Envoi…',
  camera_placeholder: 'Quelques mots (50 max)',
  camera_noWords: 'Aucun mot ne peut accompagner une réponse à la bouteille. Seule une photo est envoyée.',
  camera_error:
    'Impossible de démarrer la caméra. Cette app n’accepte que les photos prises avec la caméra de l’appareil (pas d’import). Vérifiez l’autorisation de la caméra dans votre navigateur.',
  camera_failed: 'Envoi impossible.',
  post_report: 'Signaler',
  post_reported: 'Signalé',
  post_reportPrompt: 'Signaler cette publication. Indiquez la raison.',
  post_reportDefault: 'Image inappropriée',
  bottle_lead: 'Envoyez une photo : elle atteint quelqu’un dans le monde. Une vous parvient aussi.',
  bottle_shoot: 'Photographier et lancer à la mer',
  bottle_note:
    'Un échange unique. Vous ne pouvez pas savoir qui c’est. Pourtant, vous ressentez quelqu’un vivant le même instant ailleurs dans le monde.',
  bottle_loading: 'Recherche d’une bouteille…',
  bottle_arrived: 'C’est arrivé',
  bottle_replyIntro:
    'Vous ne pouvez répondre qu’une fois. Une photo ou une réaction : choisissez. Aucun mot possible.',
  bottle_replyPhoto: 'Répondre par une photo',
  bottle_replyReaction: 'Répondre par une réaction',
  bottle_back: 'Retour',
  bottle_yourReply: 'Votre réponse',
  bottle_closed: 'Cet échange de bouteille est terminé. À une prochaine fois, avec quelqu’un d’autre.',
  reaction_thanks: 'Merci',
  reaction_lovely: 'Magnifique',
  reaction_smile: 'Apaisant',
  reaction_genki: 'Ça réconforte',
  language: 'Langue'
}

const pt: Dict = {
  appName: 'Janela para o Mundo',
  tagline: 'Um olhar sereno sobre a Terra de hoje.',
  modeLocal: 'Modo demo local',
  tab_bottle: 'Garrafa',
  tab_window: 'Mundo',
  window_today: 'O mundo hoje',
  window_loading: 'Carregando as paisagens de hoje…',
  window_empty1: 'Ainda não há publicações hoje.',
  window_empty2: 'Em algum lugar do mundo, espera-se a primeira foto.',
  fab_aria: 'Tirar uma foto',
  toast_postedDelivered: 'Compartilhado com o mundo. Também chegou a alguém.',
  toast_posted: 'Compartilhado com o mundo.',
  toast_alreadyPosted: 'Você já publicou hoje. Até amanhã.',
  toast_replyPhoto: 'Sua resposta com foto foi entregue.',
  toast_reaction: 'Seu sentimento foi entregue.',
  toast_reportDone: 'Denúncia recebida. Esta publicação será ocultada.',
  toast_loadError: 'Falha ao carregar.',
  toast_replyFail: 'Não foi possível responder.',
  camera_titlePost: 'Capture este momento',
  camera_titleReply: 'Responder com uma foto',
  camera_submitPost: 'Enviar ao mundo',
  camera_submitReply: 'Enviar resposta',
  camera_shutter: 'Disparador',
  camera_close: 'Fechar',
  camera_retake: 'Refazer',
  camera_sending: 'Enviando…',
  camera_placeholder: 'Algumas palavras (até 50)',
  camera_noWords: 'Não é possível adicionar palavras à resposta da garrafa. Apenas uma foto é enviada.',
  camera_error:
    'Não foi possível iniciar a câmera. Este app só aceita fotos tiradas com a câmera do dispositivo (sem upload). Verifique a permissão da câmera no navegador.',
  camera_failed: 'Não foi possível enviar.',
  post_report: 'Denunciar',
  post_reported: 'Denunciado',
  post_reportPrompt: 'Denunciar esta publicação. Informe o motivo.',
  post_reportDefault: 'Imagem inadequada',
  bottle_lead: 'Envie uma foto e ela chega a alguém no mundo. Uma também chega até você.',
  bottle_shoot: 'Tirar foto e lançar ao mar',
  bottle_note:
    'Uma troca única. Você não pode saber quem é. Ainda assim, sente alguém vivendo o mesmo momento em algum lugar do mundo.',
  bottle_loading: 'Procurando uma garrafa…',
  bottle_arrived: 'Chegou',
  bottle_replyIntro:
    'Você pode responder apenas uma vez. Uma foto ou uma reação — escolha uma. Sem palavras.',
  bottle_replyPhoto: 'Responder com foto',
  bottle_replyReaction: 'Responder com reação',
  bottle_back: 'Voltar',
  bottle_yourReply: 'Sua resposta',
  bottle_closed: 'Esta troca de garrafa terminou. Até a próxima, com alguém novo.',
  reaction_thanks: 'Obrigado',
  reaction_lovely: 'Lindo',
  reaction_smile: 'Reconfortante',
  reaction_genki: 'Me animou',
  language: 'Idioma'
}

const de: Dict = {
  appName: 'Fenster zur Welt',
  tagline: 'Ein stiller Blick auf die Erde von heute.',
  modeLocal: 'Lokaler Demomodus',
  tab_bottle: 'Flaschenpost',
  tab_window: 'Welt',
  window_today: 'Die Welt heute',
  window_loading: 'Heutige Ansichten werden geladen…',
  window_empty1: 'Heute noch keine Beiträge.',
  window_empty2: 'Irgendwo auf der Welt wartet das erste Foto.',
  fab_aria: 'Foto aufnehmen',
  toast_postedDelivered: 'Mit der Welt geteilt. Es hat auch jemanden erreicht.',
  toast_posted: 'Mit der Welt geteilt.',
  toast_alreadyPosted: 'Du hast heute schon gepostet. Bis morgen.',
  toast_replyPhoto: 'Deine Fotoantwort wurde zugestellt.',
  toast_reaction: 'Dein Gefühl wurde übermittelt.',
  toast_reportDone: 'Meldung erhalten. Dieser Beitrag wird ausgeblendet.',
  toast_loadError: 'Laden fehlgeschlagen.',
  toast_replyFail: 'Antwort nicht möglich.',
  camera_titlePost: 'Diesen Moment festhalten',
  camera_titleReply: 'Mit einem Foto antworten',
  camera_submitPost: 'In die Welt senden',
  camera_submitReply: 'Antwort senden',
  camera_shutter: 'Auslöser',
  camera_close: 'Schließen',
  camera_retake: 'Neu aufnehmen',
  camera_sending: 'Senden…',
  camera_placeholder: 'Ein paar Worte (max. 50)',
  camera_noWords: 'Einer Flaschenpost-Antwort können keine Worte beigefügt werden. Es wird nur ein Foto gesendet.',
  camera_error:
    'Kamera konnte nicht gestartet werden. Diese App unterstützt nur mit der Gerätekamera aufgenommene Fotos (kein Upload). Bitte prüfe die Kameraberechtigung im Browser.',
  camera_failed: 'Senden nicht möglich.',
  post_report: 'Melden',
  post_reported: 'Gemeldet',
  post_reportPrompt: 'Diesen Beitrag melden. Bitte gib einen Grund an.',
  post_reportDefault: 'Unangemessenes Bild',
  bottle_lead: 'Sende ein Foto – es erreicht jemanden auf der Welt. Auch dich erreicht eines.',
  bottle_shoot: 'Foto machen & treiben lassen',
  bottle_note:
    'Ein einmaliger Austausch. Du kannst nicht wissen, wer es ist. Und doch spürst du jemanden, der irgendwo den gleichen Moment lebt.',
  bottle_loading: 'Suche nach einer Flaschenpost…',
  bottle_arrived: 'Angekommen',
  bottle_replyIntro:
    'Du kannst nur einmal antworten. Ein Foto oder eine Reaktion – wähle eines. Keine Worte möglich.',
  bottle_replyPhoto: 'Mit Foto antworten',
  bottle_replyReaction: 'Mit Reaktion antworten',
  bottle_back: 'Zurück',
  bottle_yourReply: 'Deine Antwort',
  bottle_closed: 'Dieser Flaschenpost-Austausch ist beendet. Bis zum nächsten Mal, mit jemand Neuem.',
  reaction_thanks: 'Danke',
  reaction_lovely: 'Wunderschön',
  reaction_smile: 'Beruhigend',
  reaction_genki: 'Aufbauend',
  language: 'Sprache'
}

export const DICTS: Record<Lang, Dict> = { ja, en, zh, ko, es, fr, pt, de }
