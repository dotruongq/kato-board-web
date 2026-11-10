// What the family does for the pond while Đô is away. Written to be read on a
// phone by people who don't keep koi: one action per line, short words.
// Pictures live in public/guide/.

export type Lang = 'vi' | 'en'
export type Text = Record<Lang, string>

export interface Step {
  text: Text
  img?: string
  /** Shown in red under the step. */
  warn?: Text
  /** Slug of another guide to jump to from this step. */
  link?: string
}

export interface Guide {
  slug: string
  group: GroupId
  title: Text
  /** Picture on the menu card. */
  img: string
  danger?: boolean
  /** Red box at the top of the page. */
  alert?: Text
  /** "Before you start" checklist. */
  before?: Text[]
  steps: Step[]
}

export type GroupId = 'test' | 'food' | 'treat' | 'care'

export const GROUPS: { id: GroupId; title: Text }[] = [
  { id: 'test', title: { vi: 'Đo nước', en: 'Test the water' } },
  { id: 'food', title: { vi: 'Làm đồ ăn cho cá', en: 'Make fish food' } },
  { id: 'treat', title: { vi: 'Muối và thuốc', en: 'Salt and medicine' } },
  { id: 'care', title: { vi: 'Chăm hồ và cá', en: 'Pond and fish care' } },
]

export const UI = {
  title: { vi: 'Hướng dẫn chăm hồ cá', en: 'Pond care guide' },
  pick: { vi: 'Bấm vào việc cần làm.', en: 'Tap the job you need to do.' },
  before: { vi: 'Trước khi làm', en: 'Before you start' },
  steps: { vi: 'Các bước', en: 'Steps' },
  done: { vi: 'Xong!', en: 'Done!' },
  menu: { vi: 'Menu', en: 'Menu' },
  danger: { vi: 'Nguy hiểm', en: 'Danger' },
  goTo: { vi: 'Xem cách làm', en: 'See how' },
  zoom: { vi: 'Bấm vào hình để xem lớn', en: 'Tap a picture to make it bigger' },
} satisfies Record<string, Text>

export const GUIDES: Guide[] = [
  {
    slug: 'ammonia',
    group: 'test',
    title: { vi: 'Đo Ammonia (chai Monitor xanh)', en: 'Test ammonia (green Monitor bottles)' },
    img: 'monitor-1',
    steps: [
      { text: { vi: 'Lấy 5 ml nước hồ, cho vào ly test.', en: 'Put 5 ml of pond water in the test cup.' }, img: 'test-cup' },
      { text: { vi: 'Lấy chai Monitor số 1. Nhỏ 4 giọt vào ly.', en: 'Take Monitor bottle 1. Add 4 drops.' }, img: 'monitor-1' },
      { text: { vi: 'Lắc đều.', en: 'Shake.' } },
      { text: { vi: 'Lấy chai Monitor số 2. Nhỏ 4 giọt vào ly.', en: 'Take Monitor bottle 2. Add 4 drops.' }, img: 'monitor-2' },
      { text: { vi: 'Lắc đều.', en: 'Shake.' } },
      { text: { vi: 'Đợi 5 phút.', en: 'Wait 5 minutes.' } },
      { text: { vi: 'So màu. Đọc kết quả.', en: 'Match the color. Read the result.' } },
    ],
  },
  {
    slug: 'nitrite',
    group: 'test',
    title: { vi: 'Đo Nitrite (chai API hồng)', en: 'Test nitrite (pink API bottle)' },
    img: 'api-pink',
    steps: [
      { text: { vi: 'Lấy 5 ml nước hồ, cho vào ly test.', en: 'Put 5 ml of pond water in the test cup.' }, img: 'test-cup' },
      { text: { vi: 'Lấy chai API màu hồng. Nhỏ 5 giọt vào ly.', en: 'Take the pink API bottle. Add 5 drops.' }, img: 'api-pink' },
      { text: { vi: 'Lắc đều.', en: 'Shake.' } },
      { text: { vi: 'Đợi 5 phút.', en: 'Wait 5 minutes.' } },
      { text: { vi: 'So màu. Đọc kết quả.', en: 'Match the color. Read the result.' } },
    ],
  },
  {
    slug: 'salt-test',
    group: 'test',
    title: { vi: 'Đo muối', en: 'Test the salt' },
    img: 'salt-pen-water',
    steps: [
      { text: { vi: 'Lấy bút đo. Bấm sang chế độ SALT.', en: 'Take the test pen. Switch it to SALT.' }, img: 'salt-pen-mode' },
      { text: { vi: 'Nhúng bút vào nước hồ.', en: 'Put the pen in the pond water.' } },
      { text: { vi: 'Đợi 10 giây.', en: 'Wait 10 seconds.' }, img: 'salt-pen-water' },
      { text: { vi: 'Đọc số khi bút vẫn còn trong nước.', en: 'Read the number. Keep the pen in the water.' } },
    ],
  },
  {
    slug: 'masheer-food',
    group: 'food',
    title: { vi: 'Đồ ăn cá Mị Nương (Masheer)', en: 'Food for the Masheer fish' },
    img: 'mixer',
    steps: [
      { text: { vi: 'Lấy một ít bột agar.', en: 'Take a little agar powder.' }, img: 'agar' },
      { text: { vi: 'Cho vào ly nước.', en: 'Put it in a glass of water.' }, img: 'water-glass' },
      { text: { vi: 'Bỏ lò vi sóng tới khi sôi.', en: 'Microwave it until it boils.' } },
      { text: { vi: 'Lấy thức ăn cá.', en: 'Get the fish food.' }, img: 'fish-food' },
      { text: { vi: 'Múc 4 muỗng lớn thức ăn vào máy trộn.', en: 'Put 4 big scoops of food in the mixer.' }, img: 'big-scoop' },
      { text: { vi: 'Bấm nút cho máy chạy.', en: 'Press the button to start the mixer.' }, img: 'mixer' },
      {
        text: { vi: 'Máy đang chạy: đổ nước agar vào từ từ.', en: 'While it mixes, pour in the agar water slowly.' },
        warn: { vi: 'Đừng đổ nhiều. Nhiều quá sẽ nhão, không trộn được.', en: "Don't pour too much. Too much makes it mushy." },
      },
      { text: { vi: 'Lấy muỗng đỏ nhỏ. Dùng nó cho các bột dưới đây.', en: 'Get the small red spoon. Use it for the powders below.' }, img: 'red-spoon' },
      { text: { vi: '1 muỗng đỏ vitamin (hộp trắng, chữ "Bột Nghệ").', en: '1 red spoon of vitamin (white tub that says "Bột Nghệ").' }, img: 'vitamin' },
      { text: { vi: '¼ muỗng đỏ bột tỏi.', en: '¼ red spoon of garlic powder.' }, img: 'garlic' },
      { text: { vi: '1 muỗng đỏ bột tiêu hoá Radost.', en: '1 red spoon of Radost (digestion powder).' }, img: 'radost' },
      { text: { vi: '2 muỗng đỏ bột tảo Spirulina.', en: '2 red spoons of Spirulina.' }, img: 'spirulina' },
      {
        text: { vi: 'Bỏ bột vào từ từ, cho bột dính đều lên thức ăn.', en: 'Add the powders slowly so they coat the food.' },
        warn: { vi: 'Nhão quá? Lấy muỗng trộn thêm bằng tay.', en: 'Too mushy? Stir with a spoon by hand.' },
      },
      { text: { vi: 'Đợi máy trộn xong.', en: 'Wait for the mixer to finish.' } },
      { text: { vi: 'Còn ướt? Trộn thêm, hoặc để tới sáng mai rồi cho ăn.', en: 'Still wet? Mix more, or wait until tomorrow morning to feed.' } },
    ],
  },
  {
    slug: 'koi-food',
    group: 'food',
    title: { vi: 'Đồ ăn cá Koi', en: 'Food for the koi' },
    img: 'fish-food',
    steps: [
      { text: { vi: 'Lấy một ít bột agar.', en: 'Take a little agar powder.' }, img: 'agar' },
      { text: { vi: 'Cho vào ly nước.', en: 'Put it in a glass of water.' }, img: 'water-glass' },
      { text: { vi: 'Bỏ lò vi sóng tới khi sôi.', en: 'Microwave it until it boils.' } },
      { text: { vi: 'Lấy thức ăn cá.', en: 'Get the fish food.' }, img: 'fish-food' },
      { text: { vi: 'Múc 4 muỗng lớn thức ăn vào máy trộn.', en: 'Put 4 big scoops of food in the mixer.' }, img: 'big-scoop' },
      { text: { vi: 'Bấm nút cho máy chạy.', en: 'Press the button to start the mixer.' }, img: 'mixer' },
      {
        text: { vi: 'Máy đang chạy: đổ nước agar vào từ từ.', en: 'While it mixes, pour in the agar water slowly.' },
        warn: { vi: 'Đừng đổ nhiều. Nhiều quá sẽ nhão, không trộn được.', en: "Don't pour too much. Too much makes it mushy." },
      },
      { text: { vi: 'Lấy muỗng đỏ nhỏ. Dùng nó cho các bột dưới đây.', en: 'Get the small red spoon. Use it for the powders below.' }, img: 'red-spoon' },
      { text: { vi: '1 muỗng đỏ vitamin (hộp trắng, chữ "Bột Nghệ").', en: '1 red spoon of vitamin (white tub that says "Bột Nghệ").' }, img: 'vitamin' },
      {
        text: { vi: '¼ muỗng đỏ bột tỏi.', en: '¼ red spoon of garlic powder.' },
        img: 'garlic',
        warn: { vi: 'Cá Koi: KHÔNG bỏ Radost. KHÔNG bỏ Spirulina.', en: 'Koi: NO Radost. NO Spirulina.' },
      },
      {
        text: { vi: 'Bỏ bột vào từ từ, cho bột dính đều lên thức ăn.', en: 'Add the powders slowly so they coat the food.' },
        warn: { vi: 'Nhão quá? Lấy muỗng trộn thêm bằng tay.', en: 'Too mushy? Stir with a spoon by hand.' },
      },
      { text: { vi: 'Đợi máy trộn xong.', en: 'Wait for the mixer to finish.' } },
      { text: { vi: 'Còn ướt? Trộn thêm, hoặc để tới sáng mai rồi cho ăn.', en: 'Still wet? Mix more, or wait until tomorrow morning to feed.' } },
    ],
  },
  {
    slug: 'add-salt',
    group: 'treat',
    title: { vi: 'Bỏ muối vào hồ', en: 'Add salt to the pond' },
    img: 'salt-bag',
    before: [
      { vi: 'Mua muối ở Home Depot. Khoảng $10 một bao 40 lbs.', en: 'Buy salt at Home Depot. About $10 for a 40 lb bag.' },
      { vi: 'Muối nguyên chất. Không có chất phụ gia.', en: 'Pure salt only. Nothing added.' },
      { vi: 'KHÔNG dùng muối i-ốt.', en: 'NOT iodized salt.' },
    ],
    steps: [
      { text: { vi: 'Đo muối trong hồ trước.', en: 'Test the salt in the pond first.' }, link: 'salt-test' },
      { text: { vi: 'Gọi Đô. Hỏi bỏ bao nhiêu muối.', en: 'Call Đô. Ask how much salt to add.' } },
      { text: { vi: 'Xé bao. Đổ xuống hồ.', en: 'Open the bag. Pour it in the pond.' }, img: 'salt-bag' },
    ],
  },
  {
    slug: 'bsdt',
    group: 'treat',
    title: { vi: 'Đánh thuốc BSDT', en: 'BSDT medicine' },
    img: 'bsdt',
    before: [
      { vi: 'Chỉ làm buổi tối, khi có người ở nhà.', en: 'Only in the evening, when someone is home.' },
      { vi: 'Phải đo muối trước.', en: 'Test the salt first.' },
      { vi: 'Chỉ làm khi muối 0.10% hoặc thấp hơn.', en: 'Only if the salt is 0.10% or lower.' },
    ],
    steps: [
      { text: { vi: 'Đo muối. Trên 0.10% thì KHÔNG làm.', en: 'Test the salt. Above 0.10%? STOP.' }, link: 'salt-test' },
      { text: { vi: 'Mở sủi oxy thật mạnh.', en: 'Turn the air pump up high.' } },
      {
        text: {
          vi: 'Đong thuốc ra ca nhựa. 100 ml cho mỗi 1000 gallon. Hồ nhà mình 2500–3000 gallon = 250–300 ml.',
          en: 'Pour the medicine into a plastic cup. 100 ml for every 1000 gallons. Our pond is 2500–3000 gallons = 250–300 ml.',
        },
        img: 'bsdt',
      },
      { text: { vi: 'Đổ thuốc vào xô lớn có nước. Nước bao nhiêu cũng được.', en: 'Pour it into a big bucket of water. Any amount of water is fine.' } },
      { text: { vi: 'Đổ xô xuống hồ.', en: 'Pour the bucket into the pond.' } },
      { text: { vi: 'Nước hồ ra màu xanh dương. Vậy là đúng.', en: 'The pond turns blue. That is normal.' } },
      { text: { vi: 'Nếu cần: làm lại mỗi ngày 1 lần, trong 3 ngày.', en: 'If needed: do it again once a day, for 3 days.' } },
    ],
  },
  {
    slug: 'fluke-m',
    group: 'treat',
    title: { vi: 'Đánh thuốc Fluke M', en: 'Fluke M medicine' },
    img: 'fluke-m',
    steps: [
      { text: { vi: 'Lấy gói Fluke M ra khỏi bịch.', en: 'Take the Fluke M pack out of the bag.' }, img: 'fluke-m' },
      { text: { vi: 'Lấy cân tiểu ly.', en: 'Get the small kitchen scale.' }, img: 'scale' },
      {
        text: {
          vi: 'Cân bột. 12 gram cho mỗi 1000 gallon. Hồ nhà mình 2500–3500 gallon = 30–42 gram.',
          en: 'Weigh the powder. 12 grams for every 1000 gallons. Our pond is 2500–3500 gallons = 30–42 grams.',
        },
      },
      { text: { vi: 'Đổ vào hồ.', en: 'Pour it in the pond.' } },
      { text: { vi: 'Nếu cần: làm lại sau 5 ngày.', en: 'If needed: do it again after 5 days.' } },
    ],
  },
  {
    slug: 'potassium',
    group: 'treat',
    title: { vi: 'Đánh thuốc tím', en: 'Purple medicine (potassium permanganate)' },
    img: 'chloram-x',
    danger: true,
    alert: {
      vi: 'Cân sai là chết cả hồ. Phải gọi Đô trước.',
      en: 'A wrong amount kills the whole pond. Call Đô first.',
    },
    before: [
      { vi: 'Đo thật kỹ lượng nước trong hồ.', en: 'Measure how much water is in the pond. Carefully.' },
      { vi: 'Để sẵn bột Chloram-X bên cạnh.', en: 'Keep Chloram-X powder ready, right next to you.' },
      { vi: 'Mở sủi oxy thật mạnh.', en: 'Turn the air pump up high.' },
      { vi: 'Phải có người ở nhà ít nhất 2 tiếng.', en: 'Someone must be home for at least 2 hours.' },
    ],
    steps: [
      { text: { vi: 'Đo lượng nước trong hồ.', en: 'Measure how much water is in the pond.' } },
      { text: { vi: 'Gọi Đô. Đô tính số gram thuốc tím.', en: 'Call Đô. Đô works out how many grams.' } },
      {
        text: { vi: 'Cân thật chính xác bằng cân tiểu ly.', en: 'Weigh it exactly on the small scale.' },
        img: 'scale',
        warn: { vi: 'Cân sai là chết cả hồ.', en: 'A wrong amount kills the whole pond.' },
      },
      { text: { vi: 'Đổ thuốc tím vào xô nhựa có sẵn nước.', en: 'Put it in a plastic bucket with water.' } },
      { text: { vi: 'Khuấy thật đều.', en: 'Stir well.' } },
      { text: { vi: 'Đổ 30% xô xuống hồ.', en: 'Pour 30% of the bucket into the pond.' } },
      {
        text: { vi: 'Đứng coi cá.', en: 'Watch the fish.' },
        warn: {
          vi: 'Cá nhảy, sốc, bơi nhanh? Đổ Chloram-X ngay để khử tím. DỪNG LẠI.',
          en: 'Fish jumping, in shock, swimming fast? Pour in Chloram-X now. STOP.',
        },
        img: 'chloram-x',
      },
      {
        text: {
          vi: 'Sau 30 phút: hết màu tím, hoặc nước ra màu trà? Đổ thêm 30%.',
          en: 'After 30 minutes: no more purple, or water looks like tea? Pour in another 30%.',
        },
      },
      { text: { vi: 'Làm vậy cho đủ 2 tiếng thì thôi.', en: 'Keep doing this for 2 hours. Then stop.' } },
      { text: { vi: 'Đổ Chloram-X để khử tím.', en: 'Pour in Chloram-X to clear the purple.' }, img: 'chloram-x' },
    ],
  },
  {
    slug: 'bacteria',
    group: 'care',
    title: { vi: 'Đánh vi sinh', en: 'Add good bacteria' },
    img: 'bacteria-jar',
    before: [
      { vi: 'Làm đều đặn, khoảng 2 lần 1 tuần.', en: 'Do it often, about 2 times a week.' },
      {
        vi: 'Hoặc khi nước quá đục, nhiều bọt và dơ.',
        en: 'Or when the water is very cloudy, foamy and dirty.',
      },
    ],
    steps: [
      {
        text: { vi: 'Lấy hũ vi sinh.', en: 'Get the bacteria jar.' },
        img: 'bacteria-jar',
        warn: {
          vi: 'Hũ ghi "Minced Garlic" nhưng bên trong là vi sinh. KHÔNG phải tỏi.',
          en: 'The jar says "Minced Garlic", but it holds bacteria. It is NOT garlic.',
        },
      },
      {
        text: {
          vi: 'Lấy 1 cái muỗng nhỏ. Hồ trong nhà: nửa muỗng cà phê. Hồ lớn: 1 muỗng cà phê.',
          en: 'Get a small spoon. Indoor pond: half a teaspoon. Big pond: 1 teaspoon.',
        },
        img: 'bacteria-powder',
      },
      {
        text: {
          vi: 'Bỏ vào hồ. Chỉ bỏ vào ngăn lọc bánh phồng tôm.',
          en: 'Put it in the pond. Only in the filter part with the "shrimp chip" filter pieces.',
        },
      },
    ],
  },
  {
    slug: 'sedate-koi',
    group: 'care',
    title: { vi: 'Đánh thuốc mê cá Koi', en: 'Put a koi to sleep (clove oil)' },
    img: 'clove-oil',
    danger: true,
    alert: {
      vi: 'Nhiều thuốc quá, cá mê quá sâu. Chỉ 2 nắp.',
      en: 'Too much and the fish sleeps too deep. Only 2 caps.',
    },
    steps: [
      {
        text: { vi: 'Lấy cái chậu màu xanh. Đổ nước hồ vào, khoảng 30% chậu.', en: 'Get the blue tub. Fill it about 30% with pond water.' },
      },
      { text: { vi: 'Lấy chai thuốc mê Clove.', en: 'Get the Clove oil bottle.' }, img: 'clove-oil' },
      { text: { vi: 'Dùng cái nắp chai để đong, không dùng muỗng.', en: 'Use the bottle cap to measure. Not a spoon.' } },
      {
        text: { vi: 'Bỏ 2 nắp màu đen vào chậu. Vậy thôi.', en: 'Put 2 black caps into the tub. No more.' },
        warn: { vi: 'Bỏ nhiều, cá sẽ hôn mê rất nhanh.', en: 'Too much and the fish passes out very fast.' },
      },
      { text: { vi: 'Cá bắt đầu yếu: thử lật bụng cá lên.', en: 'When the fish gets weak, try turning it belly up.' } },
      {
        text: { vi: 'Cá vẫn còn khỏe quá? Thêm 1 nắp nữa.', en: 'Fish still too strong? Add 1 more cap.' },
        warn: { vi: 'Cẩn thận, đừng bỏ quá nhiều.', en: "Careful. Don't add too much." },
      },
      {
        text: {
          vi: 'Cá nằm yên, không cử động hoặc cử động ít = cá đã hôn mê.',
          en: 'Fish lies still, not moving or barely moving = it is asleep.',
        },
      },
      {
        text: { vi: 'Làm việc cần làm. Tối đa 5 phút sau khi cá hôn mê.', en: 'Do what you need to do. 5 minutes at most after it falls asleep.' },
        warn: { vi: 'Lâu hơn, cá sẽ rất khó tỉnh.', en: 'Longer than that and the fish is very hard to wake.' },
      },
      { text: { vi: 'Mở sủi oxy thật mạnh. Cho cá tắm oxy.', en: 'Turn the air pump up high. Give the fish an oxygen bath.' } },
      {
        text: {
          vi: 'Cá mê quá sâu? Đưa miệng cá vào ống xả nước, cho nước có oxy chảy thẳng vào miệng cá.',
          en: 'Fish asleep too deep? Hold its mouth at the water outlet pipe, so oxygen-rich water flows straight into its mouth.',
        },
      },
      { text: { vi: 'Cá bắt đầu thở là cá sẽ tỉnh lại.', en: 'Once the fish starts breathing, it will wake up.' } },
    ],
  },
]
