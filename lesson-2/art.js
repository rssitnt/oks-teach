/* Local raster scenes. Provenance and semantic approval live in assets.json. */
(function () {
  'use strict';

  const labels = Object.freeze({
    rabbit: 'A rabbit', train: 'A train at a railway station', table: 'A wooden table',
    draw: 'A girl drawing a picture', homework: 'A girl doing homework at a desk',
    homeworkGroup: 'Two pupils doing separate maths homework at a shared table',
    climb: 'A boy climbing a tree', kind: 'A boy helping a younger child with fallen books',
    find: 'A child finding a lost pencil', now: 'A boy running now',
    room: 'Комната с мебелью и игрушками', watch: 'A boy watching television',
    watchGroup: 'Three children watching television', football: 'Children playing football',
    read: 'A girl reading a book', readingGirls: 'Two girls, each reading her own book',
    bike: 'A child riding a bicycle', music: 'A girl listening to music through headphones',
    games: 'A boy playing a game on a desktop computer', write: 'A boy writing in his notebook',
    run: 'A boy running in a grassy field', rabbitBox: 'A rabbit climbing onto a cardboard box',
    homeworkPOV: 'A school notebook and the learner’s hands',
    rude: 'Ben pushing past a younger child and interrupting', friendly: 'Mia welcoming a younger friend',
    funny: 'Ben telling a funny story while Mia and Tom laugh', shy: 'Mia feeling shy at the classroom board',
    helpful: 'A boy helping a younger child pick up books', calendarTuesday: 'A Tuesday calendar page',
    fridayFootball: 'A boy playing football, with a recurring Friday schedule', drawTrain: 'Mia drawing a train on her paper',
    benClimb: 'Ben climbing a tree', tomHelp: 'Tom helping a younger friend pick up fallen books'
  });
  const sceneKeys = Object.freeze(Object.keys(labels));
  // Exact paths, dimensions, hashes and provenance from the parent’s confirmed plan.
  const generated = Object.freeze({
    type: 'generated-photographic-scene',
    source: 'Google AI Pro Gemini 3.1 Flash Image subscription, explicitly authorised for missing exact scenes',
    license: 'Generated for this educational project; fictional people',
    changes: 'Cropped from coherent photographic series and converted to WebP'
  });
  const ownerOriginal = Object.freeze({
    type: 'owner-original-photograph',
    source: 'Owner supplied original diagnostic material; same existing public file',
    license: 'Reuse authorised by owner; upstream rights not independently verified',
    changes: 'None'
  });
  function photograph(source, downloadURL, author, license, changes = 'Resized/converted to WebP') {
    return Object.freeze({ type: 'licensed-photograph', source, download_url: downloadURL, author, license, changes });
  }
  function asset(path, width, height, sha256, provenance, semantic, contextText) {
    const record = { path, width, height, sha256, provenance, source: provenance.source, rights: provenance.license, semantic, approved_by: 'Main visual inspection' };
    if (contextText) record.contextText = Object.freeze(contextText);
    return Object.freeze(record);
  }
  const pexels = 'https://www.pexels.com/license/';
  const footballPhoto = photograph('https://commons.wikimedia.org/wiki/File:Children_playing_soccer.jpg', 'https://upload.wikimedia.org/wikipedia/commons/2/29/Children_playing_soccer.jpg', 'Bill Branson / National Cancer Institute', 'https://creativecommons.org/publicdomain/mark/1.0/');
  const runningPhoto = photograph('https://www.pexels.com/photo/boy-running-on-field-21705250/', 'https://images.pexels.com/photos/21705250/pexels-photo-21705250.jpeg?cs=srgb&dl=pexels-justphotof-21705250.jpg&fm=jpg', 'JustPhotof Photo & Video', pexels);
  const drawing = asset('images/drawTrain.webp', 443, 369, 'ffc33d70a90b179f52ad85430628620bb2618f886645c163ed7ed2569e2f1a2c', generated, 'Girl Mia actively draws visible locomotive on flat paper; not a physical train');
  const climbing = asset('images/benClimb.webp', 444, 369, '9c458ddb608ad8c63c08212f36160f552e0fa2041172a608ff5fbdc630eb6d75', generated, 'Boy Ben has both hands on trunk and foot on low branch; clearly climbing');
  const helping = asset('images/tomHelp.webp', 444, 369, '763bae4bc6f176e9d1ce27c9cdf9d65dc49659ae2abb39fa8a6b7b75cd65e1c4', generated, 'Boy Tom retrieves fallen books with younger child');
  const footballSemantic = 'Source explicitly two boys in uniforms dribbling football across field; public-domain US government work.';
  const runningSemantic = 'Black-and-white child running grassy field, source confirmed.';
  const baseAssets = Object.freeze({
    rabbit: asset('../images/rabbit.jpg', 600, 491, 'ad5d5bda6028f7c70c9d852b530fb54172b390da78f496d24645eac43a75679e', ownerOriginal, 'Owner-supplied rabbit photograph outdoors.'),
    train: asset('../images/train.jpg', 600, 449, '073f45fbc233a74dc91221faa5195da65aa46a14e23408a962f0a75894066be0', ownerOriginal, 'Modern red/yellow train at a railway station; original owner-supplied photograph.'),
    table: asset('../images/table.jpg', 600, 337, '608a5c5228833d5374ca11e071e07a7a49fb1038e3dbadda8ccb02c5d6193df4', ownerOriginal, 'Rectangular wooden table on a white background; original owner-supplied photograph.'),
    draw: drawing,
    homework: asset('images/homework.webp', 444, 368, '2749394a0d53b859df213207195092e11278388f7b3f3c460bbc9a247cf2a8d0', generated, 'Girl Mia writing elementary maths in flat notebook; no art/reading'),
    homeworkGroup: asset('images/homeworkGroup.webp', 684, 768, '1aada1b81168585c8153aab70eb7bb80103ad26c283ce2c71b07c0ca5401f6d5', generated, 'Two pupils both writing separate maths exercise notebooks'),
    climb: climbing,
    kind: helping,
    find: asset('images/find.webp', 685, 380, '41af646c2e9c1281bd682a0507a0f2d4d7c2acef23c7d2e9b6f8d5c4b1a78b5c', generated, 'Child discovers and picks up lost blue pencil under chair'),
    now: asset('images/run.webp', 500, 750, '100775c8352a9004455e83103ecf14e3da2768de384de660dcefa7afa10d6de1', runningPhoto, runningSemantic, ['NOW — СЕЙЧАС']),
    room: asset('images/room.webp', 1200, 896, 'a7c9822e4a6321e86f874c254d50125920d264410301573a17520e6304c8eb7f', generated, 'Rabbit directly under wooden table; separate chair/bed/toytrain; accepted exact hitboxes'),
    watch: asset('images/watch.webp', 1000, 667, '808095f37d8b85046fce2432b172c600afbcd670d946c687ee4a921b98335588', photograph('https://www.pexels.com/photo/a-father-and-boy-watching-on-the-tv-6557551/', 'https://images.pexels.com/photos/6557551/pexels-photo-6557551.jpeg?cs=srgb&dl=pexels-cottonbro-6557551.jpg&fm=jpg', 'cottonbro studio', pexels), 'VISUALLY VERIFIED visible TV with hockey and father+boy backs. Conditional: not boy alone; crop Commons watchGroup might be cleaner.'),
    watchGroup: asset('images/watchGroup.webp', 684, 706, '07661685de99fe258c56a6b6f391eb67686e4ea5486591be4348c155d4f0d6b8', generated, 'Three children faces not visible; all heads point towards clearly visible TV'),
    football: asset('images/football.webp', 1000, 667, 'fa56545fcbfd93d497d305ba6c1fa2546a5185e4f081249f98ef6027adb179a1', footballPhoto, footballSemantic),
    read: asset('images/read.webp', 960, 640, '2a8a28c79c145dd9d9c559a1dec3de394b4770173e4d1ec2994e25ec562ef4a6', photograph('https://commons.wikimedia.org/wiki/File:Girl_reading_a_book_(15072194361).jpg', 'https://upload.wikimedia.org/wikipedia/commons/d/df/Girl_reading_a_book_%2815072194361%29.jpg', 'Personal Creations', 'https://creativecommons.org/licenses/by/2.0/'), 'Girl reading a book, source title confirmed.'),
    readingGirls: asset('images/readingGirls.webp', 1000, 667, '7796dd1e74169e651d9d8cca81f747d9865e891f4e91fe0fc886039fc3061feb', photograph('https://www.pexels.com/photo/attentive-diverse-schoolgirls-reading-textbooks-in-autumn-park-5896522/', 'https://images.pexels.com/photos/5896522/pexels-photo-5896522.jpeg?cs=srgb&dl=pexels-mary-taylor-5896522.jpg&fm=jpg', 'Mary Taylor', pexels), 'Source explicitly two girls reading books outdoors.'),
    bike: asset('images/bike.webp', 260, 325, '4922a18711d18b5306a494313216954acc5e2f10b60edc21e94ebb5648277f19', photograph('https://commons.wikimedia.org/wiki/File:A_child_rides_a_bike.jpg', 'https://upload.wikimedia.org/wikipedia/commons/f/f5/A_child_rides_a_bike.jpg', 'Nohafawzy', 'https://creativecommons.org/licenses/by-sa/4.0/', 'Resized/converted to WebP; bike cropped around rider and bicycle'), 'Child riding bike; source confirmed photographic contest entry.'),
    music: asset('images/music.webp', 1000, 667, '07106ec813fef463b41911cf6571cce41afb254e8059613f400d85eec3f45c1c', photograph('https://www.pexels.com/photo/photo-of-child-using-headphones-3891209/', 'https://images.pexels.com/photos/3891209/pexels-photo-3891209.jpeg?cs=srgb&dl=pexels-olly-3891209.jpg&fm=jpg', 'Andrea Piacquadio', pexels), 'Girl enjoying music with headphones; genuine camera metadata Canon EOS 5DS, taken 2018.'),
    games: asset('images/games.webp', 501, 750, '4b6ea1adcdf3923f4053894aa180ea500033101dc1e36cc8b7f0208abdff34a2', photograph('https://www.pexels.com/photo/a-boy-playing-games-on-a-computer-10643464/', 'https://images.pexels.com/photos/10643464/pexels-photo-10643464.jpeg?cs=srgb&dl=pexels-ron-lach-10643464.jpg&fm=jpg', 'Ron Lach', pexels), 'VISUALLY VERIFIED boy at desktop, visible game on HP monitor; unmistakably desktop game, not tablet.'),
    write: asset('images/write.webp', 1000, 750, '4168cd4dfbeb8364df7e7700e12d81ad1e768bf4451e5f7037561eea4870c377', photograph('https://www.pexels.com/photo/photo-of-a-boy-writing-in-his-notebook-at-school-15891442/', 'https://images.pexels.com/photos/15891442/pexels-photo-15891442.jpeg?cs=srgb&dl=pexels-bm-creatives-373679883-15891442.jpg&fm=jpg', 'Bm Creatives', pexels), 'Boy writing notebook at school; source confirmed.'),
    run: asset('images/run.webp', 500, 750, '100775c8352a9004455e83103ecf14e3da2768de384de660dcefa7afa10d6de1', runningPhoto, runningSemantic),
    rabbitBox: asset('images/rabbitBox.webp', 684, 380, '32fbecd2944a9bc6e555bfe52c1f9816d157aad11ed3bb6686e7e5f9a99eca55', generated, 'Realistic rabbit front paws on box, rear paws floor; climbing onto box'),
    homeworkPOV: asset('images/homeworkPOV.webp', 685, 325, '5b4a14ff27e22ed6b97ea1e263b94003a4449b4abf5f9f66e06b4641cb132bfd', generated, 'First-person-like overhead only hands and primary-maths notebook; head excluded'),
    rude: asset('images/rude.webp', 685, 380, '7e94e2168e1b40007c1dd2116f581b286fdece629a0279468c377ce75e81965a', generated, 'Boy interrupts/pushes past child at doorway; dismissive gesture'),
    friendly: asset('images/friendly.webp', 684, 380, '7247870156cd66e3e2ca1f1a4054d752be5819f3a16a8ee3025116bf70caf570', generated, 'Girl waves and welcomes arriving classmate'),
    funny: asset('images/funny.webp', 685, 379, '57ce23cd4b0bdf6f92642a102150efc44bff86e8d2e9a4cb6bc498e7dd11f61c', generated, 'Boy tells story while listeners look at him and laugh'),
    shy: asset('images/shy.webp', 684, 379, '84eb359ab0b69b7c80bd53682233ff7545cd887deeef81bf7cfe86a7cd9a28fd', generated, 'Girl at classroom front holds notebook close and looks hesitant'),
    helpful: helping,
    calendarTuesday: asset('images/calendarTuesday.webp', 684, 379, '236ad26c91ca3a54145dafc592ff593de6877142d47adf37e4e7b07d429f2712', generated, 'Photographic tear-off calendar, correctly printed Tuesday13'),
    fridayFootball: asset('images/football.webp', 1000, 667, 'fa56545fcbfd93d497d305ba6c1fa2546a5185e4f081249f98ef6027adb179a1', footballPhoto, footballSemantic, ['Friday · Friday · Friday', 'Каждую пятницу — снова футбол.']),
    drawTrain: drawing,
    benClimb: climbing,
    tomHelp: helping
  });


  // Each override has a distinct inspected scene, not an alias to the story image.
  function freezeRegistry(records) {
    return Object.freeze(Object.fromEntries(Object.entries(records).map(([key, record]) => [key, Object.freeze(record)])));
  }
  const variants = freezeRegistry({
  "drawHome": {
    "path": "images/drawHome.webp",
    "width": 1000,
    "height": 667,
    "sha256": "b5acabba30ee1a1fcb2f11af8b55496953381a7224fc2e7a280d1cc7174e8bb5",
    "provenance": {
      "type": "licensed-photograph",
      "source": "https://www.pexels.com/photo/girl-drawing-on-a-paper-7025504/",
      "download_url": "https://images.pexels.com/photos/7025504/pexels-photo-7025504.jpeg?w=1200",
      "author": "Vlada Karpovich",
      "license": "https://www.pexels.com/license/",
      "changes": "Resized and converted to WebP"
    },
    "source": "https://www.pexels.com/photo/girl-drawing-on-a-paper-7025504/",
    "rights": "https://www.pexels.com/license/",
    "semantic": "Overhead view of a schoolgirl drawing a colourful picture with a pencil at a home art table.",
    "approved_by": "Image implementer visual inspection; independent verifier pending"
  },
  "drawEvent": {
    "path": "images/drawEvent.webp",
    "width": 750,
    "height": 1000,
    "sha256": "4bc6264aa0fac9d5a1949a6191229807e13bec7ccbf6b8f3be6926c81f7dbcee",
    "provenance": {
      "type": "licensed-photograph",
      "source": "https://www.pexels.com/photo/a-close-up-shot-of-a-girl-drawing-7344942/",
      "download_url": "https://images.pexels.com/photos/7344942/pexels-photo-7344942.jpeg?w=1200",
      "author": "Monu Masud",
      "license": "https://www.pexels.com/license/",
      "changes": "Resized and converted to WebP"
    },
    "source": "https://www.pexels.com/photo/a-close-up-shot-of-a-girl-drawing-7344942/",
    "rights": "https://www.pexels.com/license/",
    "semantic": "Girl at an outdoor cultural event actively draws outlines on white paper with a blue pencil.",
    "approved_by": "Image implementer visual inspection; independent verifier pending"
  },
  "drawGarden": {
    "path": "images/drawGarden.webp",
    "width": 667,
    "height": 1000,
    "sha256": "267c42ff701b2f28d79848aa54b0381a79c14b842a1f461873626018029478a5",
    "provenance": {
      "type": "licensed-photograph",
      "source": "https://www.pexels.com/photo/a-girl-drawing-in-a-notebook-12886928/",
      "download_url": "https://images.pexels.com/photos/12886928/pexels-photo-12886928.jpeg?w=1200",
      "author": "Mizuno K",
      "license": "https://www.pexels.com/license/",
      "changes": "Resized and converted to WebP"
    },
    "source": "https://www.pexels.com/photo/a-girl-drawing-in-a-notebook-12886928/",
    "rights": "https://www.pexels.com/license/",
    "semantic": "Curly-haired girl at a garden table actively drawing circular shapes in a sketchbook; paper and pencil visible.",
    "approved_by": "Image implementer visual inspection; independent verifier pending"
  },
  "drawCrayon": {
    "path": "images/drawCrayon.webp",
    "width": 1000,
    "height": 667,
    "sha256": "cd0196951f19c261a67e5705806c22c03aff8a4a3f30874d89aed0f6fa2de759",
    "provenance": {
      "type": "licensed-photograph",
      "source": "https://www.pexels.com/photo/girl-holding-crayon-coloring-white-paper-3891193/",
      "download_url": "https://images.pexels.com/photos/3891193/pexels-photo-3891193.jpeg?w=1200",
      "author": "Andrea Piacquadio",
      "license": "https://www.pexels.com/license/",
      "changes": "Resized and converted to WebP"
    },
    "source": "https://www.pexels.com/photo/girl-holding-crayon-coloring-white-paper-3891193/",
    "rights": "https://www.pexels.com/license/",
    "semantic": "Red-haired girl at indoor table actively drawing small shapes with a pencil on white paper.",
    "approved_by": "Image implementer visual inspection; independent verifier pending"
  },
  "watchBean": {
    "path": "images/watchBean.webp",
    "width": 667,
    "height": 1000,
    "sha256": "bece805d8639daf49599f0f0b2b5eefe30139f524c4e0785c31a5a8256c08cc3",
    "provenance": {
      "type": "licensed-photograph",
      "source": "https://www.pexels.com/photo/a-boy-sitting-on-a-bean-bag-while-busy-watching-television-12475137/",
      "download_url": "https://images.pexels.com/photos/12475137/pexels-photo-12475137.jpeg?w=1200",
      "author": "Atlantic Ambience",
      "license": "https://www.pexels.com/license/",
      "changes": "Resized and converted to WebP"
    },
    "source": "https://www.pexels.com/photo/a-boy-sitting-on-a-bean-bag-while-busy-watching-television-12475137/",
    "rights": "https://www.pexels.com/license/",
    "semantic": "Single boy reclines on a blue bean bag, holding TV remote and looking at visible wall-mounted TV; no games controller.",
    "approved_by": "Image implementer visual inspection; independent verifier pending"
  },
  "footballSingle": {
    "path": "images/footballSingle.jpg",
    "width": 800,
    "height": 1200,
    "sha256": "a06197b937a526d2ce686bc72c8f22667b2275dd41ab48292dcaff1ee6e85bac",
    "provenance": {
      "type": "licensed-photograph",
      "source": "https://www.pexels.com/photo/back-view-of-a-boy-playing-football-26871768/",
      "download_url": "https://images.pexels.com/photos/26871768/pexels-photo-26871768.jpeg",
      "author": "Eunjin Baek",
      "license": "https://www.pexels.com/license/",
      "changes": "Reduced to 1200 px on the long side and re-saved as progressive JPEG; full composition preserved"
    },
    "source": "https://www.pexels.com/photo/back-view-of-a-boy-playing-football-26871768/",
    "rights": "https://www.pexels.com/license/",
    "semantic": "One foreground boy actively plays with a visible football on grass; distant passerby on background pavement is not playing and does not share the foreground action.",
    "approved_by": "Image implementer visual inspection; independent verifier pending"
  },
  "helpLibrary": {
    "path": "images/helpLibrary.webp",
    "width": 1200,
    "height": 896,
    "sha256": "aca494c598b85302880f605c0c5424c0f53ece55c634dbb7cec25fd7242afde3",
    "provenance": {
      "type": "generated-photographic-scene",
      "source": "Google AI Pro Gemini 3.1 Flash Image subscription; project-authorised exact educational scenes",
      "model": "google-ai-pro/gemini-3.1-flash-image",
      "route": "OmniRoute -> Antigravity Manager -> Google AI Pro",
      "license": "Generated for this educational project; fictional people",
      "changes": "None; generated directly as WebP"
    },
    "source": "Google AI Pro Gemini 3.1 Flash Image subscription; project-authorised exact educational scenes",
    "rights": "Generated for this educational project; fictional people",
    "semantic": "Mustard-shirt older boy crouches and hands a fallen blue book to younger child with backpack; scattered closed books establish helping pick up books.",
    "approved_by": "Image implementer visual inspection; independent verifier pending"
  },
  "watchSofa": {
    "path": "images/watchSofa.webp",
    "width": 1200,
    "height": 896,
    "sha256": "ba034131545f04ed916c45f197c827f4470fd1a9ecb32f0b1f1f80509f71289d",
    "provenance": {
      "type": "generated-photographic-scene",
      "source": "Google AI Pro Gemini 3.1 Flash Image subscription; project-authorised exact educational scenes",
      "model": "google-ai-pro/gemini-3.1-flash-image",
      "route": "OmniRoute -> Antigravity Manager -> Google AI Pro",
      "license": "Generated for this educational project; fictional people",
      "changes": "None; generated directly as WebP"
    },
    "source": "Google AI Pro Gemini 3.1 Flash Image subscription; project-authorised exact educational scenes",
    "rights": "Generated for this educational project; fictional people",
    "semantic": "Orange-shirt boy alone on grey sofa visibly looks toward an entire TV displaying an animated forest; empty hands, no game controller.",
    "approved_by": "Image implementer visual inspection; independent verifier pending"
  },
  "watchRug": {
    "path": "images/watchRug.webp",
    "width": 1200,
    "height": 896,
    "sha256": "88731f9030c8490d624f8fdd262c71e6dee3c1019009086fb82ea4dd0749bdc9",
    "provenance": {
      "type": "generated-photographic-scene",
      "source": "Google AI Pro Gemini 3.1 Flash Image subscription; project-authorised exact educational scenes",
      "model": "google-ai-pro/gemini-3.1-flash-image",
      "route": "OmniRoute -> Antigravity Manager -> Google AI Pro",
      "license": "Generated for this educational project; fictional people",
      "changes": "None; generated directly as WebP"
    },
    "source": "Google AI Pro Gemini 3.1 Flash Image subscription; project-authorised exact educational scenes",
    "rights": "Generated for this educational project; fictional people",
    "semantic": "Green-striped-pyjama boy alone cross-legged on red rug looks toward a visible TV displaying fish; hands on knees, no controller.",
    "approved_by": "Image implementer visual inspection; independent verifier pending"
  },
  "climbPark": {
    "path": "images/climbPark.webp",
    "width": 1200,
    "height": 896,
    "sha256": "92b235e4359091b4116ac00af6549b0fdcdce3720ddd7d6e3c86cf256d741885",
    "provenance": {
      "type": "generated-photographic-scene",
      "source": "Google AI Pro Gemini 3.1 Flash Image subscription; project-authorised exact educational scenes",
      "model": "google-ai-pro/gemini-3.1-flash-image",
      "route": "OmniRoute -> Antigravity Manager -> Google AI Pro",
      "license": "Generated for this educational project; fictional people",
      "changes": "None; generated directly as WebP"
    },
    "source": "Google AI Pro Gemini 3.1 Flash Image subscription; project-authorised exact educational scenes",
    "rights": "Generated for this educational project; fictional people",
    "semantic": "Red-check-shirt boy climbs low oak tree, both hands on trunk and both shoes on low branch in an upward-moving stance; full body and tree visible.",
    "approved_by": "Image implementer visual inspection; independent verifier pending"
  },
  "rabbitFluffy": {
    "path": "../images/fluffy_rabbit.jpg",
    "width": 600,
    "height": 539,
    "sha256": "09f550d128430faa200e717440773736f3e66d5634b03d05eb0dc04713c306a0",
    "provenance": {
      "type": "owner-original-photograph",
      "source": "Owner supplied original diagnostic material; same existing public file",
      "license": "Reuse authorised by owner; upstream rights not independently verified",
      "changes": "None"
    },
    "source": "Owner supplied original diagnostic material; same existing public file",
    "rights": "Reuse authorised by owner; upstream rights not independently verified",
    "semantic": "Fluffy rabbit outdoors, different rabbit portrait for vocabulary recall.",
    "approved_by": "Image implementer visual inspection; independent verifier pending"
  },
  "readWeek": {
    "path": "../images/girl_reading.jpg",
    "width": 600,
    "height": 400,
    "sha256": "02b8ad4115bce8881022b7d5d5e25abda8e38fbcd48af6c66a18cd15ca5bbcf0",
    "provenance": {
      "type": "owner-original-photograph",
      "source": "Owner supplied original diagnostic material; same existing public file",
      "license": "Reuse authorised by owner; upstream rights not independently verified",
      "changes": "None"
    },
    "source": "Owner supplied original diagnostic material; same existing public file",
    "rights": "Reuse authorised by owner; upstream rights not independently verified",
    "semantic": "Single girl reading an open book for My Week activity.",
    "approved_by": "Image implementer visual inspection; independent verifier pending"
  },
  "bikeWeek": {
    "path": "../images/speaking_after_school.jpg",
    "width": 600,
    "height": 600,
    "sha256": "de750a9db18381f7147a4358656d6e75d0c1a141a746e50ebd36d004f5cdf4bb",
    "provenance": {
      "type": "owner-original-photograph",
      "source": "Owner supplied original diagnostic material; same existing public file",
      "license": "Reuse authorised by owner; upstream rights not independently verified",
      "changes": "None"
    },
    "source": "Owner supplied original diagnostic material; same existing public file",
    "rights": "Reuse authorised by owner; upstream rights not independently verified",
    "semantic": "Helmet-wearing child rides a bicycle outdoors; wheels and rider visible.",
    "approved_by": "Image implementer visual inspection; independent verifier pending"
  },
  "footballWeek": {
    "path": "../images/children_playing_football.jpg",
    "width": 600,
    "height": 450,
    "sha256": "8b9b88b724c49318971083f130bc52c2b3ce5e425f8acec973c01a9f9b9ca61f",
    "provenance": {
      "type": "owner-original-photograph",
      "source": "Owner supplied original diagnostic material; same existing public file",
      "license": "Reuse authorised by owner; upstream rights not independently verified",
      "changes": "None"
    },
    "source": "Owner supplied original diagnostic material; same existing public file",
    "rights": "Reuse authorised by owner; upstream rights not independently verified",
    "semantic": "Several children actively play football together; suitable generic/plural My Week activity.",
    "approved_by": "Image implementer visual inspection; independent verifier pending"
  },
  "homeworkWeek": {
    "path": "../images/hub_grammar.jpg",
    "width": 600,
    "height": 338,
    "sha256": "f2a124ce9e46610cf459ead21906654cf2d6ac5f129b71f8a8b6707923833eac",
    "provenance": {
      "type": "owner-original-photograph",
      "source": "Owner supplied original diagnostic material; same existing public file",
      "license": "Reuse authorised by owner; upstream rights not independently verified",
      "changes": "None"
    },
    "source": "Owner supplied original diagnostic material; same existing public file",
    "rights": "Reuse authorised by owner; upstream rights not independently verified",
    "semantic": "Girl works in a school workbook at a desk; suitable doing homework, not drawing.",
    "approved_by": "Image implementer visual inspection; independent verifier pending"
  },
  "drawPink": {
    "path": "images/drawPink.jpg",
    "width": 1200,
    "height": 800,
    "sha256": "f14442c4908816e2aab7c4d343e792fad200b45ebf7c845bb137759b1b51461f",
    "provenance": {
      "type": "licensed-photograph",
      "source": "https://www.pexels.com/photo/a-girl-drawing-using-a-pink-colored-pencil-11286163/",
      "download_url": "https://images.pexels.com/photos/11286163/pexels-photo-11286163.jpeg",
      "author": "Anna Shvets",
      "license": "https://www.pexels.com/license/",
      "changes": "Reduced to 1200 px on the long side and re-saved as progressive JPEG; full composition preserved"
    },
    "source": "https://www.pexels.com/photo/a-girl-drawing-using-a-pink-colored-pencil-11286163/",
    "rights": "https://www.pexels.com/license/",
    "semantic": "Girl in pink sweatshirt actively draws her own visible outlines on white paper with a pink coloured pencil; pencil tip and marks visible, no paint or preprinted colouring page.",
    "approved_by": "Image implementer visual inspection; independent verifier pending"
  }
});
  const contexts = freezeRegistry({
  "words-nine-cards": {
    "rabbit": "rabbitFluffy"
  },
  "words-find-rabbit": {
    "rabbit": "rabbitFluffy"
  },
  "academy-now": {
    "draw": "drawEvent",
    "watch": "watchSofa"
  },
  "academy-grow-she": {
    "draw": "drawEvent"
  },
  "academy-assertion": {
    "draw": "drawEvent"
  },
  "academy-build-tv": {
    "watch": "watchSofa"
  },
  "academy-question-she": {
    "draw": "drawEvent"
  },
  "academy-question-he": {
    "watch": "watchSofa"
  },
  "academy-answer-yes": {
    "draw": "drawEvent",
    "watch": "watchSofa"
  },
  "academy-answer-no": {
    "draw": "drawEvent",
    "watch": "watchSofa"
  },
  "actions-gap-i": {
    "draw": "drawGarden"
  },
  "actions-gap-he": {
    "watch": "watchRug"
  },
  "actions-gap-rabbit": {
    "watch": "watchRug"
  },
  "actions-build-she": {
    "draw": "drawGarden",
    "watch": "watchRug"
  },
  "actions-mistake-missing": {
    "watch": "watchRug"
  },
  "actions-mistake-she": {
    "draw": "drawGarden"
  },
  "actions-question-boy": {
    "draw": "drawGarden",
    "watch": "watchRug"
  },
  "actions-question-girls": {
    "watch": "watchRug"
  },
  "actions-extra-builder": {
    "draw": "drawGarden",
    "benClimb": "climbPark"
  },
  "week-activities": {
    "draw": "drawPink",
    "watch": "watchBean",
    "read": "readWeek",
    "bike": "bikeWeek",
    "football": "footballWeek",
    "homework": "homeworkWeek"
  },
  "week-now-contrast": {
    "watch": "watchBean"
  },
  "week-reading-now": {
    "watch": "watchBean",
    "read": "readWeek"
  },
  "personality-five-stories": {
    "kind": "tomHelp"
  },
  "personality-helpful": {
    "helpful": "tomHelp"
  },
  "personality-match-help": {
    "helpful": "tomHelp"
  }
});
  const assets = Object.freeze({ ...baseAssets, draw: variants.drawHome, climb: variants.climbPark, kind: variants.helpLibrary, helpful: variants.helpLibrary, fridayFootball: Object.freeze({ ...variants.footballSingle, contextText: baseAssets.fridayFootball.contextText }) });
  function resolveAsset(key, context) {
    const override = typeof context === 'string' && Object.prototype.hasOwnProperty.call(contexts, context)
      && Object.prototype.hasOwnProperty.call(contexts[context], key) ? contexts[context][key] : null;
    return { key: override || key, asset: override ? (variants[override] || assets[override]) : assets[key] };
  }

  // Percent bounds refer to the accepted 1200 × 896 room photograph.
  // Chair clipping removes the tabletop intersection, keeping click regions disjoint.
  const roomTargets = Object.freeze([
    Object.freeze({ key: 'chair', x: 6, y: 25, width: 23, height: 56,
      clip: 'polygon(0 0,100% 0,100% 3.5714%,30.4348% 3.5714%,30.4348% 23.2143%,100% 23.2143%,100% 100%,0 100%)' }),
    Object.freeze({ key: 'table', x: 13, y: 27, width: 50, height: 11 }),
    Object.freeze({ key: 'bed', x: 63, y: 28, width: 37, height: 39 }),
    Object.freeze({ key: 'rabbit', x: 41, y: 49, width: 12, height: 26 }),
    Object.freeze({ key: 'train', x: 67, y: 71, width: 24, height: 23 })
  ]);

  function esc(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }
  function localPath(path) {
    return typeof path === 'string' && /^(?:images\/|\.\.\/images\/)[A-Za-z0-9_-]+\.(?:webp|png|jpe?g)$/i.test(path);
  }
  function failureUI() {
    return '<span class="scene-image-error scene-placeholder" role="status" hidden>Картинка не загрузилась. Не отвечай на задание по невидимой картинке. Обновите страницу; если это не помогло, позови учителя.</span>';
  }
  function hotspots() {
    return roomTargets.map((target, index) => {
      const style = `left:${target.x}%;top:${target.y}%;width:${target.width}%;height:${target.height}%;${target.clip ? `clip-path:${target.clip};` : ''}`;
      const name = `Предмет ${index + 1}`;
      return `<button type="button" class="scene-hotspot" data-hotspot="${target.key}" style="${style}" aria-label="${name}"><span class="scene-hotspot-label" hidden>${name}</span></button>`;
    }).join('');
  }
  function LessonArt(key, options = {}) {
    const known = sceneKeys.includes(key);
    const settings = options && typeof options === 'object' ? options : {};
    // An explicit generic label must win even for room/quiz scenes, without answer leakage.
    const label = Object.prototype.hasOwnProperty.call(settings, 'label')
      ? String(settings.label == null ? '' : settings.label)
      : (known ? labels[key] : 'Учебная картинка недоступна');
    const resolved = known ? resolveAsset(key, settings.context) : { key, asset: null };
    const asset = resolved.asset;
    const path = asset && localPath(asset.path) ? asset.path : (known ? `images/${key}.webp` : '');
    if (!path) return '<div class="raster-scene scene-image-failed" role="status">Учебная картинка недоступна. Позови учителя.</div>';
    const dimensions = asset && Number.isSafeInteger(asset.width) && asset.width > 0 && Number.isSafeInteger(asset.height) && asset.height > 0
      ? ` width="${asset.width}" height="${asset.height}"` : '';
    const room = key === 'room';
    const context = asset && Array.isArray(asset.contextText)
      ? `<span class="scene-context">${asset.contextText.map(line => esc(line)).join('<br>')}</span>` : '';
    return `<div class="raster-scene" data-scene="${esc(key)}" data-asset="${esc(resolved.key)}"${room ? ' role="group" aria-label="Комната: выбери предмет"' : ''} style="position:relative"><div class="scene-media" style="position:relative"><img class="scene-image" src="${esc(path)}"${dimensions} alt="${esc(label)}" decoding="async" style="display:block;width:100%;height:auto">${room ? hotspots() : ''}</div>${failureUI()}${context}</div>`;
  }

  function setImageState(image, failed) {
    const wrapper = image.closest('.raster-scene');
    if (!wrapper) return;
    wrapper.classList.toggle('scene-image-failed', failed);
    const status = wrapper.querySelector('.scene-image-error');
    if (status) status.hidden = !failed;
    wrapper.querySelectorAll('button[data-hotspot]').forEach(button => {
      if (failed && !button.disabled) {
        button.disabled = true;
        button.dataset.rasterDisabled = 'true';
      } else if (!failed && button.dataset.rasterDisabled === 'true') {
        delete button.dataset.rasterDisabled;
        button.disabled = button.getAttribute('aria-disabled') === 'true';
      }
    });
  }
  // Capture is needed because image load/error events do not bubble.
  // Rendering also works in a DOM-free consumer such as the lesson data checks.
  if (typeof document !== 'undefined' && typeof HTMLImageElement !== 'undefined') {
    document.addEventListener('error', event => {
      if (event.target instanceof HTMLImageElement && event.target.matches('.scene-image')) setImageState(event.target, true);
    }, true);
    document.addEventListener('load', event => {
      if (event.target instanceof HTMLImageElement && event.target.matches('.scene-image')) setImageState(event.target, false);
    }, true);
  }

  LessonArt.scenes = sceneKeys;
  Object.defineProperty(LessonArt, 'assets', { value: assets, enumerable: true });
  Object.defineProperty(LessonArt, 'variants', { value: variants, enumerable: true });
  Object.defineProperty(LessonArt, 'contexts', { value: contexts, enumerable: true });
  window.LessonArt = LessonArt;
}());
