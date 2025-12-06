export type GrammarRule = {
    name: string;
    form: string; 
    usage: string; 
    example: string; 
};

export type VocabularyItem = {
    word: string;
    type: string;
    meaning: string;
};

export type LessonContent = {
    id: number;
    levelTag: string;
    topic: string;
    vocabulary: VocabularyItem[]; 
    grammar: GrammarRule[]; 
};

export const lessonContentData: LessonContent[] = [
    // ===============================================
    // I. SECTION 1: CƠ BẢN (A1 - A2)
    // ===============================================

    // --- A1: Căn bản ---
    // ID 1: Chào hỏi & Giới thiệu
    {
        id: 1,
        levelTag: 'A1',
        topic: 'Chào hỏi & Giới thiệu',
        vocabulary: [
            { word: 'Hello', type: 'Interjection', meaning: 'Xin chào' }, { word: 'name', type: 'N', meaning: 'tên' },
            { word: 'from', type: 'Prep', meaning: 'từ' }, { word: 'country', type: 'N', meaning: 'quốc gia' },
            { word: 'nice', type: 'Adj', meaning: 'tốt, đẹp' }, { word: 'meet', type: 'V', meaning: 'gặp gỡ' },
            { word: 'goodbye', type: 'Exclamation', meaning: 'Tạm biệt' }, { word: 'student', type: 'N', meaning: 'học sinh' },
            { word: 'teacher', type: 'N', meaning: 'giáo viên' }, { word: 'job', type: 'N', meaning: 'công việc' },
            { word: 'here', type: 'Adv', meaning: 'ở đây' }, { word: 'age', type: 'N', meaning: 'tuổi' },
            { word: 'welcome', type: 'Exclamation', meaning: 'Chào mừng' }, { word: 'thank you', type: 'Exclamation', meaning: 'Cảm ơn' },
            { word: 'sorry', type: 'Adj', meaning: 'xin lỗi' }, { word: 'I', type: 'Pron', meaning: 'tôi' },
            { word: 'you', type: 'Pron', meaning: 'bạn' }, { word: 'he', type: 'Pron', meaning: 'anh ấy' },
            { word: 'she', type: 'Pron', meaning: 'cô ấy' }, { word: 'it', type: 'Pron', meaning: 'nó' },
        ],
        grammar: [
            { name: 'Động từ To Be (Hiện tại)', form: 'S + am / is / are', usage: 'Giới thiệu bản thân, quốc tịch, nghề nghiệp, trạng thái.', example: 'I am a student. She is from Vietnam.' },
            { name: 'Đại từ nhân xưng', form: 'I, You, He, She, It, We, They', usage: 'Sử dụng làm chủ ngữ trong câu.', example: 'We are happy. It is a new book.' },
            { name: 'Cấu trúc giới thiệu', form: 'My name is [Tên]. / I am [Tên].', usage: 'Giới thiệu tên, nghề nghiệp hoặc nơi đến.', example: 'My name is Elisa. I am from Hanoi.' },
            { name: 'Câu hỏi Wh- (What, Who)', form: 'Wh-word + To Be + ...?', usage: 'Hỏi thông tin cơ bản về tên, nghề nghiệp, người.', example: 'What is your job? Who is he?' },
            { name: 'Cụm Nice to meet you', form: 'Nice to meet you / Nice to meet you, too!', usage: 'Dùng khi gặp gỡ ai đó lần đầu tiên.', example: 'A: Hello, I\'m Tom. B: Nice to meet you!' },
        ],
    },
    
    // ID 2: Gia đình & Bạn bè
    {
        id: 2,
        levelTag: 'A1',
        topic: 'Gia đình & Bạn bè',
        vocabulary: [
            { word: 'mother', type: 'N', meaning: 'mẹ' }, { word: 'father', type: 'N', meaning: 'cha' },
            { word: 'brother', type: 'N', meaning: 'anh/em trai' }, { word: 'sister', type: 'N', meaning: 'chị/em gái' },
            { word: 'friend', type: 'N', meaning: 'bạn bè' }, { word: 'tall', type: 'Adj', meaning: 'cao' },
            { word: 'short', type: 'Adj', meaning: 'thấp' }, { word: 'happy', type: 'Adj', meaning: 'vui vẻ' },
            { word: 'kind', type: 'Adj', meaning: 'tử tế' }, { word: 'smart', type: 'Adj', meaning: 'thông minh' },
            { word: 'pet', type: 'N', meaning: 'thú cưng' }, { word: 'dog', type: 'N', meaning: 'chó' },
            { word: 'cat', type: 'N', meaning: 'mèo' }, { word: 'eyes', type: 'N', meaning: 'mắt' },
            { word: 'hair', type: 'N', meaning: 'tóc' }, { word: 'baby', type: 'N', meaning: 'em bé' },
            { word: 'cousin', type: 'N', meaning: 'anh/chị em họ' }, { word: 'family', type: 'N', meaning: 'gia đình' },
            { word: 'house', type: 'N', meaning: 'nhà' }, { word: 'picture', type: 'N', meaning: 'bức ảnh' },
        ],
        grammar: [
            { name: 'Tính từ sở hữu', form: 'My, Your, His, Her, Its, Our, Their + Noun', usage: 'Chỉ ra đối tượng thuộc về ai.', example: 'This is my mother. Her dog is very big.' },
            { name: 'Danh từ số ít/số nhiều', form: 'N (+s/es)', usage: 'Chỉ số lượng một hay nhiều hơn một.', example: 'one book, two books. a box, many boxes.' },
            { name: 'Sở hữu cách (\'s)', form: 'Noun + \'s + Noun', usage: 'Chỉ sở hữu của người hoặc vật.', example: 'This is Tom\'s car. (Chiếc xe của Tom)' },
            { name: 'Sử dụng Have/Has', form: 'S + have / has + Noun', usage: 'Chỉ sự sở hữu (có cái gì đó).', example: 'I have one sister. He has a cat.' },
            { name: 'Miêu tả ngoại hình cơ bản', form: 'S + To Be + Adj. / S + Have/Has + Adj + Noun', usage: 'Miêu tả đặc điểm ngoại hình hoặc tính cách.', example: 'She is tall. He has short hair.' },
        ],
    },

    // ID 3: Rương A1/1
    { id: 3, levelTag: 'A1', topic: 'Rương A1/1', vocabulary: [], grammar: [] },

    // ID 4: Cuộc sống hàng ngày
    {
        id: 4,
        levelTag: 'A1',
        topic: 'Cuộc sống hàng ngày',
        vocabulary: [
            { word: 'wake up', type: 'V', meaning: 'thức dậy' }, { word: 'eat', type: 'V', meaning: 'ăn' },
            { word: 'drink', type: 'V', meaning: 'uống' }, { word: 'work', type: 'V', meaning: 'làm việc' },
            { word: 'study', type: 'V', meaning: 'học tập' }, { word: 'go to bed', type: 'V', meaning: 'đi ngủ' },
            { word: 'always', type: 'Adv', meaning: 'luôn luôn' }, { word: 'usually', type: 'Adv', meaning: 'thường xuyên' },
            { word: 'often', type: 'Adv', meaning: 'thường' }, { word: 'sometimes', type: 'Adv', meaning: 'thỉnh thoảng' },
            { word: 'never', type: 'Adv', meaning: 'không bao giờ' }, { word: 'morning', type: 'N', meaning: 'buổi sáng' },
            { word: 'afternoon', type: 'N', meaning: 'buổi chiều' }, { word: 'evening', type: 'N', meaning: 'buổi tối' },
            { word: 'night', type: 'N', meaning: 'đêm' }, { word: 'breakfast', type: 'N', meaning: 'bữa sáng' },
            { word: 'dinner', type: 'N', meaning: 'bữa tối' }, { word: 'shower', type: 'N', meaning: 'tắm vòi sen' },
            { word: 'read', type: 'V', meaning: 'đọc' }, { word: 'watch', type: 'V', meaning: 'xem' },
        ],
        grammar: [
            { name: 'Thì Hiện tại Đơn', form: 'S + V (s/es) / S + do/does + not + V', usage: 'Diễn tả thói quen, hành động lặp lại, sự thật hiển nhiên.', example: 'I usually drink coffee. She works every day.' },
            { name: 'Cấu trúc câu Phủ định', form: 'S + do not / does not + V (nguyên mẫu)', usage: 'Phủ nhận một sự thật hay thói quen.', example: 'He does not work on weekends.' },
            { name: 'Cấu trúc câu Nghi vấn', form: 'Do / Does + S + V (nguyên mẫu)?', usage: 'Đặt câu hỏi về thói quen, sở thích.', example: 'Do you study every day? Does she live here?' },
            { name: 'Vị trí Trạng từ tần suất', form: 'S + Adv. Tần suất + V / S + To Be + Adv. Tần suất', usage: 'Thể hiện mức độ thường xuyên của hành động.', example: 'She often reads. They are usually late.' },
            { name: 'Sử dụng "Every"', form: 'Every + Time Unit (day, week, month...)', usage: 'Chỉ sự lặp lại đều đặn.', example: 'We go to the gym every Tuesday.' },
        ],
    },

    // ID 5: Địa điểm & Nơi chốn
    {
        id: 5,
        levelTag: 'A1',
        topic: 'Địa điểm & Nơi chốn',
        vocabulary: [
            { word: 'kitchen', type: 'N', meaning: 'nhà bếp' }, { word: 'bedroom', type: 'N', meaning: 'phòng ngủ' },
            { word: 'living room', type: 'N', meaning: 'phòng khách' }, { word: 'bathroom', type: 'N', meaning: 'phòng tắm' },
            { word: 'bank', type: 'N', meaning: 'ngân hàng' }, { word: 'school', type: 'N', meaning: 'trường học' },
            { word: 'park', type: 'N', meaning: 'công viên' }, { word: 'hospital', type: 'N', meaning: 'bệnh viện' },
            { word: 'supermarket', type: 'N', meaning: 'siêu thị' }, { word: 'restaurant', type: 'N', meaning: 'nhà hàng' },
            { word: 'table', type: 'N', meaning: 'cái bàn' }, { word: 'chair', type: 'N', meaning: 'cái ghế' },
            { word: 'bed', type: 'N', meaning: 'cái giường' }, { word: 'sofa', type: 'N', meaning: 'ghế sofa' },
            { word: 'door', type: 'N', meaning: 'cái cửa' }, { word: 'window', type: 'N', meaning: 'cửa sổ' },
            { word: 'street', type: 'N', meaning: 'đường phố' }, { word: 'building', type: 'N', meaning: 'tòa nhà' },
            { word: 'near', type: 'Adv', meaning: 'gần' }, { word: 'far', type: 'Adv', meaning: 'xa' },
        ],
        grammar: [
            { name: 'Giới từ vị trí (in, on, under)', form: 'Noun + To Be + Preposition + Noun', usage: 'Chỉ vị trí tĩnh của người hoặc vật.', example: 'The book is on the table. He is in the kitchen.' },
            { name: 'Sử dụng There is/There are', form: 'There is (sg.) / There are (pl.) + Noun', usage: 'Nói về sự tồn tại của người/vật tại một địa điểm.', example: 'There are two chairs. There is a cat.' },
            { name: 'Câu hỏi Where is...', form: 'Where + To Be + Noun?', usage: 'Hỏi về vị trí của người hoặc vật.', example: 'Where is the nearest bank? Where are the keys?' },
            { name: 'Đại từ chỉ định (This, That, These, Those)', form: 'This/That (sg.) / These/Those (pl.)', usage: 'Chỉ định vật ở gần (This/These) hoặc xa (That/Those).', example: 'This is my house. Those are her friends.' },
            { name: 'Sử dụng next to / behind / in front of', form: 'Noun + To Be + Preposition + Noun', usage: 'Chỉ vị trí phức tạp hơn (bên cạnh, đằng sau, phía trước).', example: 'The park is next to the school.' },
        ],
    },

    // ID 6: Mua sắm & Ăn uống
    {
        id: 6,
        levelTag: 'A1',
        topic: 'Mua sắm & Ăn uống',
        vocabulary: [
            { word: 'apple', type: 'N', meaning: 'quả táo' }, { word: 'water', type: 'N', meaning: 'nước' },
            { word: 'money', type: 'N', meaning: 'tiền' }, { word: 'coffee', type: 'N', meaning: 'cà phê' },
            { word: 'tea', type: 'N', meaning: 'trà' }, { word: 'sugar', type: 'N', meaning: 'đường' },
            { word: 'bread', type: 'N', meaning: 'bánh mì' }, { word: 'milk', type: 'N', meaning: 'sữa' },
            { word: 'buy', type: 'V', meaning: 'mua' }, { word: 'cost', type: 'V', meaning: 'có giá' },
            { word: 'price', type: 'N', meaning: 'giá' }, { word: 'cheap', type: 'Adj', meaning: 'rẻ' },
            { word: 'expensive', type: 'Adj', meaning: 'đắt' }, { word: 'some', type: 'Quantifier', meaning: 'một vài/một ít' },
            { word: 'any', type: 'Quantifier', meaning: 'bất kỳ' }, { word: 'rice', type: 'N', meaning: 'gạo' },
            { word: 'egg', type: 'N', meaning: 'trứng' }, { word: 'meat', type: 'N', meaning: 'thịt' },
            { word: 'fruit', type: 'N', meaning: 'trái cây' }, { word: 'vegetable', type: 'N', meaning: 'rau củ' },
        ],
        grammar: [
            { name: 'Danh từ đếm được/không đếm được', form: 'a/an + N đếm được (sg.) / Some + N (pl./uncountable)', usage: 'Xác định số lượng của danh từ.', example: 'We need some milk (uncountable) and an egg (countable).' },
            { name: 'Sử dụng Some/Any', form: 'Some (khẳng định) / Any (phủ định, nghi vấn)', usage: 'Chỉ số lượng không xác định.', example: 'I have some money. Do you have any sugar?' },
            { name: 'Cấu trúc Can I have...', form: 'Can I have + Noun + please?', usage: 'Yêu cầu một món đồ lịch sự khi mua sắm hoặc gọi món.', example: 'Can I have an apple, please?' },
            { name: 'How much / How many', form: 'How much + N không đếm được / How many + N đếm được (pl.)', usage: 'Hỏi về số lượng hoặc giá cả.', example: 'How much is this coffee? How many apples do you want?' },
            { name: 'Sử dụng "Would like"', form: 'S + would like + Noun', usage: 'Thể hiện mong muốn (lịch sự hơn "want").', example: 'I would like some water.' },
        ],
    },
    
    // ID 7: Thời gian & Lịch trình
    {
        id: 7,
        levelTag: 'A1',
        topic: 'Thời gian & Lịch trình',
        vocabulary: [
            { word: 'now', type: 'Adv', meaning: 'bây giờ' }, { word: 'today', type: 'Adv', meaning: 'hôm nay' },
            { word: 'tomorrow', type: 'Adv', meaning: 'ngày mai' }, { word: 'next week', type: 'Adv', meaning: 'tuần tới' },
            { word: 'currently', type: 'Adv', meaning: 'hiện tại' }, { word: 'waiting', type: 'V', meaning: 'chờ đợi' },
            { word: 'cooking', type: 'V', meaning: 'nấu ăn' }, { word: 'studying', type: 'V', meaning: 'đang học' },
            { word: 'talking', type: 'V', meaning: 'nói chuyện' }, { word: 'listening', type: 'V', meaning: 'nghe' },
            { word: 'hour', type: 'N', meaning: 'giờ' }, { word: 'minute', type: 'N', meaning: 'phút' },
            { word: 'weekend', type: 'N', meaning: 'cuối tuần' }, { word: 'meeting', type: 'N', meaning: 'cuộc họp' },
            { word: 'call', type: 'V', meaning: 'gọi điện' }, { word: 'Monday', type: 'N', meaning: 'Thứ Hai' },
            { word: 'December', type: 'N', meaning: 'Tháng Mười Hai' }, { word: 'season', type: 'N', meaning: 'mùa' },
            { word: 'holiday', type: 'N', meaning: 'ngày lễ' }, { word: 'schedule', type: 'N', meaning: 'lịch trình' },
        ],
        grammar: [
            { name: 'Thì Hiện tại Tiếp diễn', form: 'S + am/is/are + V-ing', usage: 'Diễn tả hành động đang xảy ra tại thời điểm nói.', example: 'They are waiting for the bus now.' },
            { name: 'Cấu trúc câu hỏi Wh- trong HTTD', form: 'Wh-word + am/is/are + S + V-ing?', usage: 'Hỏi về hành động đang diễn ra.', example: 'What are you doing right now?' },
            { name: 'Cách nói giờ và ngày tháng', form: 'It is [Giờ] [Phút].', usage: 'Nói về thời gian (giờ chính xác) hoặc ngày tháng.', example: 'It is ten thirty. The party is on Friday.' },
            { name: 'Sử dụng At/On/In cho thời gian', form: 'at (giờ), on (ngày), in (tháng, năm, mùa)', usage: 'Chỉ các mốc thời gian cụ thể.', example: 'at 5 PM, on Sunday, in December.' },
            { name: 'Miêu tả hành động tạm thời', form: 'S + HTTD', usage: 'Hành động diễn ra trong một khoảng thời gian giới hạn.', example: 'She is living in London this month.' },
        ],
    },
    
    // ===============================================
    // --- A2: Sơ cấp (Bắt đầu từ Unit 8) ---
    // ===============================================
    
    // ID 8: Kể chuyện Quá khứ
    { 
        id: 8, 
        levelTag: 'A2', 
        topic: 'Kể chuyện Quá khứ', 
        vocabulary: [
            { word: 'last week', type: 'Adv', meaning: 'tuần trước' }, { word: 'yesterday', type: 'Adv', meaning: 'hôm qua' },
            { word: 'ago', type: 'Adv', meaning: 'trước (thời gian)' }, { word: 'saw', type: 'V', meaning: 'đã thấy (see)' },
            { word: 'went', type: 'V', meaning: 'đã đi (go)' }, { word: 'ate', type: 'V', meaning: 'đã ăn (eat)' },
            { word: 'met', type: 'V', meaning: 'đã gặp (meet)' }, { word: 'did', type: 'Aux', meaning: 'đã làm (do)' },
            { word: 'movie', type: 'N', meaning: 'bộ phim' }, { word: 'concert', type: 'N', meaning: 'buổi hòa nhạc' },
            { word: 'trip', type: 'N', meaning: 'chuyến đi' }, { word: 'vacation', type: 'N', meaning: 'kỳ nghỉ' },
            { word: 'happy', type: 'Adj', meaning: 'vui vẻ' }, { word: 'tired', type: 'Adj', meaning: 'mệt mỏi' },
            { word: 'fun', type: 'Adj', meaning: 'vui' }, { word: 'boring', type: 'Adj', meaning: 'nhàm chán' },
            { word: 'visited', type: 'V', meaning: 'đã thăm' }, { word: 'finished', type: 'V', meaning: 'đã hoàn thành' },
            { word: 'when', type: 'Conj', meaning: 'khi' }, { word: 'happened', type: 'V', meaning: 'đã xảy ra' },
        ], 
        grammar: [
            { name: 'Thì Quá khứ Đơn (Simple Past)', form: 'S + V-ed/V2 (Quá khứ)', usage: 'Diễn tả hành động đã xảy ra và kết thúc trong quá khứ.', example: 'I visited Paris last year.' },
            { name: 'Động từ bất quy tắc cơ bản', form: 'V1 -> V2 (go -> went, see -> saw)', usage: 'Học các dạng quá khứ của các động từ thường dùng.', example: 'She went to the park yesterday.' },
            { name: 'Cấu trúc phủ định (Quá khứ)', form: 'S + did not + V (nguyên mẫu)', usage: 'Phủ nhận hành động trong quá khứ.', example: 'They did not watch the movie.' },
            { name: 'Cấu trúc nghi vấn (Quá khứ)', form: 'Did + S + V (nguyên mẫu)?', usage: 'Hỏi về hành động trong quá khứ.', example: 'Did you finish your homework?' },
            { name: 'Giới từ chỉ thời gian quá khứ', form: 'ago, last week/year, yesterday', usage: 'Dùng để xác định mốc thời gian đã qua.', example: 'He left two hours ago.' },
        ] 
    },
    
    // ID 9: Kế hoạch Tương lai
    { 
        id: 9, 
        levelTag: 'A2', 
        topic: 'Kế hoạch Tương lai', 
        vocabulary: [
            { word: 'next month', type: 'Adv', meaning: 'tháng tới' }, { word: 'soon', type: 'Adv', meaning: 'sớm' },
            { word: 'plan', type: 'V/N', meaning: 'lên kế hoạch' }, { word: 'travel', type: 'V', meaning: 'du lịch' },
            { word: 'start', type: 'V', meaning: 'bắt đầu' }, { word: 'finish', type: 'V', meaning: 'kết thúc' },
            { word: 'probably', type: 'Adv', meaning: 'có lẽ' }, { word: 'definitely', type: 'Adv', meaning: 'chắc chắn' },
            { word: 'might', type: 'Modal', meaning: 'có thể' }, { word: 'buy', type: 'V', meaning: 'mua' },
            { word: 'new car', type: 'N', meaning: 'xe mới' }, { word: 'study hard', type: 'V', meaning: 'học chăm chỉ' },
            { word: 'stay home', type: 'V', meaning: 'ở nhà' }, { word: 'call you', type: 'V', meaning: 'gọi cho bạn' },
            { word: 'tomorrow', type: 'Adv', meaning: 'ngày mai' }, { word: 'going to', type: 'Aux', meaning: 'sắp' },
            { word: 'will', type: 'Modal', meaning: 'sẽ' }, { word: 'rain', type: 'V', meaning: 'mưa' },
            { word: 'party', type: 'N', meaning: 'bữa tiệc' }, { word: 'invite', type: 'V', meaning: 'mời' },
        ], 
        grammar: [
            { name: 'Be going to', form: 'S + am/is/are + going to + V', usage: 'Diễn tả kế hoạch, dự định đã được quyết định.', example: 'I am going to visit my parents next week.' },
            { name: 'Will (Dự đoán/Quyết định tức thời)', form: 'S + will + V', usage: 'Dự đoán (thường với I think/I hope) hoặc quyết định ngay tại thời điểm nói.', example: 'I think it will rain. (Dự đoán) A: I\'m hungry. B: I will make a sandwich. (Quyết định nhanh)' },
            { name: 'So sánh Will vs Be going to', form: 'Will (chung chung/dự đoán) vs Be going to (kế hoạch cụ thể)', usage: 'Phân biệt ý định và quyết định.', example: 'She is going to study medicine. (Kế hoạch) I\'ll help you with your bags. (Quyết định tức thời)' },
            { name: 'Sử dụng Might (Khả năng thấp)', form: 'S + might + V', usage: 'Chỉ khả năng xảy ra thấp trong tương lai.', example: 'We might go to the beach, but I am not sure.' },
            { name: 'Cụm từ chỉ tương lai', form: 'next week/month/year, tomorrow, soon', usage: 'Các mốc thời gian dùng để chỉ tương lai.', example: 'He will start his new job next month.' },
        ] 
    },
    
    // ID 10: Rương A2/1
    { id: 10, levelTag: 'A2', topic: 'Rương A2/1', vocabulary: [], grammar: [] },
    
    // ID 11: Sức khỏe & Cảm xúc
    { 
        id: 11, 
        levelTag: 'A2', 
        topic: 'Sức khỏe & Cảm xúc', 
        vocabulary: [
            { word: 'headache', type: 'N', meaning: 'đau đầu' }, { word: 'fever', type: 'N', meaning: 'sốt' },
            { word: 'cough', type: 'N/V', meaning: 'ho' }, { word: 'sore throat', type: 'N', meaning: 'đau họng' },
            { word: 'sick', type: 'Adj', meaning: 'ốm' }, { word: 'healthy', type: 'Adj', meaning: 'khỏe mạnh' },
            { word: 'doctor', type: 'N', meaning: 'bác sĩ' }, { word: 'medicine', type: 'N', meaning: 'thuốc' },
            { word: 'sleep', type: 'V', meaning: 'ngủ' }, { word: 'exercise', type: 'V/N', meaning: 'tập thể dục' },
            { word: 'stressed', type: 'Adj', meaning: 'căng thẳng' }, { word: 'sad', type: 'Adj', meaning: 'buồn' },
            { word: 'angry', type: 'Adj', meaning: 'giận dữ' }, { word: 'excited', type: 'Adj', meaning: 'hào hứng' },
            { word: 'calm', type: 'Adj', meaning: 'bình tĩnh' }, { word: 'rest', type: 'V/N', meaning: 'nghỉ ngơi' },
            { word: 'feel', type: 'V', meaning: 'cảm thấy' }, { word: 'better', type: 'Adj', meaning: 'tốt hơn' },
            { word: 'drink water', type: 'V', meaning: 'uống nước' }, { word: 'take care', type: 'V', meaning: 'chăm sóc' },
        ], 
        grammar: [
            { name: 'Động từ khuyết thiếu Should/Shouldn\'t', form: 'S + should/shouldn\'t + V', usage: 'Đưa ra lời khuyên hoặc đề xuất.', example: 'You should see a doctor. He shouldn\'t eat fast food.' },
            { name: 'Sử dụng Had better (khẩn cấp hơn)', form: 'S + had better + V', usage: 'Đưa ra lời khuyên mạnh mẽ hoặc cảnh báo.', example: 'I had better go now, or I will be late.' },
            { name: 'Cấu trúc I feel...', form: 'I feel + Adjective', usage: 'Diễn tả cảm xúc hoặc trạng thái hiện tại.', example: 'I feel stressed about the exam.' },
            { name: 'Sử dụng Have a/an...', form: 'S + have/has + a/an + Illness', usage: 'Diễn tả việc mắc bệnh hoặc triệu chứng.', example: 'She has a headache.' },
            { name: 'Cấu trúc If... then...', form: 'If + Present Simple, then + S + should/must/can + V', usage: 'Đưa ra lời khuyên dựa trên một tình huống cụ thể.', example: 'If you feel tired, you should sleep early.' },
        ] 
    },
    
    // ID 12: Miêu tả Đồ vật
    { 
        id: 12, 
        levelTag: 'A2', 
        topic: 'Miêu tả Đồ vật', 
        vocabulary: [
            { word: 'big', type: 'Adj', meaning: 'lớn' }, { word: 'small', type: 'Adj', meaning: 'nhỏ' },
            { word: 'heavy', type: 'Adj', meaning: 'nặng' }, { word: 'light', type: 'Adj', meaning: 'nhẹ' },
            { word: 'new', type: 'Adj', meaning: 'mới' }, { word: 'old', type: 'Adj', meaning: 'cũ' },
            { word: 'fast', type: 'Adj', meaning: 'nhanh' }, { word: 'slow', type: 'Adj', meaning: 'chậm' },
            { word: 'expensive', type: 'Adj', meaning: 'đắt' }, { word: 'cheap', type: 'Adj', meaning: 'rẻ' },
            { word: 'color', type: 'N', meaning: 'màu sắc' }, { word: 'shape', type: 'N', meaning: 'hình dạng' },
            { word: 'size', type: 'N', meaning: 'kích cỡ' }, { word: 'material', type: 'N', meaning: 'vật liệu' },
            { word: 'red', type: 'Adj', meaning: 'màu đỏ' }, { word: 'blue', type: 'Adj', meaning: 'màu xanh dương' },
            { word: 'strong', type: 'Adj', meaning: 'mạnh/bền' }, { word: 'beautiful', type: 'Adj', meaning: 'đẹp' },
            { word: 'useful', type: 'Adj', meaning: 'hữu ích' }, { word: 'useless', type: 'Adj', meaning: 'vô dụng' },
        ], 
        grammar: [
            { name: 'So sánh hơn', form: 'Adj-er / more Adj + than', usage: 'So sánh sự khác biệt giữa hai người/vật/sự việc.', example: 'This phone is older than mine.' },
            { name: 'So sánh nhất', form: 'the Adj-est / the most Adj', usage: 'So sánh một người/vật/sự việc với một nhóm (nổi bật nhất).', example: 'This is the most expensive car in the store.' },
            { name: 'So sánh ngang bằng', form: 'as + Adj + as', usage: 'Chỉ sự bằng nhau về đặc điểm.', example: 'The small bag is as heavy as the big one.' },
            { name: 'Thứ tự tính từ cơ bản (OSASCOMP)', form: 'Ý kiến, Kích thước, Tuổi, Hình dạng, Màu sắc, Nguồn gốc, Chất liệu, Mục đích', usage: 'Sắp xếp các tính từ khi có nhiều hơn một.', example: 'a small red car (Kích thước, Màu sắc, Danh từ)' },
            { name: 'Cấu trúc It looks/feels...', form: 'It looks / feels / tastes + Adjective', usage: 'Miêu tả cảm nhận về vật/đồ ăn.', example: 'The fabric feels very soft.' },
        ] 
    },
    
    // ID 13: Phương tiện & Di chuyển
    { 
        id: 13, 
        levelTag: 'A2', 
        topic: 'Phương tiện & Di chuyển', 
        vocabulary: [
            { word: 'car', type: 'N', meaning: 'xe hơi' }, { word: 'bus', type: 'N', meaning: 'xe buýt' },
            { word: 'train', type: 'N', meaning: 'xe lửa' }, { word: 'plane', type: 'N', meaning: 'máy bay' },
            { word: 'taxi', type: 'N', meaning: 'taxi' }, { word: 'bicycle', type: 'N', meaning: 'xe đạp' },
            { word: 'walk', type: 'V', meaning: 'đi bộ' }, { word: 'drive', type: 'V', meaning: 'lái xe' },
            { word: 'ride', type: 'V', meaning: 'cưỡi/đi (xe 2 bánh)' }, { word: 'ticket', type: 'N', meaning: 'vé' },
            { word: 'station', type: 'N', meaning: 'ga/trạm' }, { word: 'airport', type: 'N', meaning: 'sân bay' },
            { word: 'across', type: 'Prep', meaning: 'ngang qua' }, { word: 'through', type: 'Prep', meaning: 'xuyên qua' },
            { word: 'towards', type: 'Prep', meaning: 'về phía' }, { word: 'turn left', type: 'V', meaning: 'rẽ trái' },
            { word: 'turn right', type: 'V', meaning: 'rẽ phải' }, { word: 'excuse me', type: 'Exclamation', meaning: 'xin lỗi (khi hỏi)' },
            { word: 'sorry', type: 'Exclamation', meaning: 'xin lỗi (khi mắc lỗi)' }, { word: 'thanks', type: 'Exclamation', meaning: 'cảm ơn' },
        ], 
        grammar: [
            { name: 'Giới từ chỉ sự chuyển động (to, from, across, through)', form: 'V + Preposition + Noun', usage: 'Chỉ hướng đi hoặc lộ trình di chuyển.', example: 'The train goes through the tunnel.' },
            { name: 'Sử dụng Go/Come/Get', form: 'Go to/from, Come from, Get to/on/off', usage: 'Các cụm động từ cơ bản cho việc di chuyển.', example: 'How do I get to the bank? Let\'s get on the bus.' },
            { name: 'Hỏi và chỉ đường cơ bản', form: 'How do I get to [Địa điểm]? Go straight, turn left.', usage: 'Yêu cầu và đưa ra chỉ dẫn đường đi.', example: 'Excuse me, how do I get to the museum?' },
            { name: 'Phương tiện: By vs On/In', form: 'By + Phương tiện (by bus) / On/In (in a taxi, on the bus)', usage: 'Dùng giới từ để chỉ cách thức di chuyển.', example: 'I go to work by bus, but I am in a taxi now.' },
            { name: 'Ngôn ngữ xã giao (Hỏi đường/Xin lỗi)', form: 'Excuse me, I\'m sorry, Thank you', usage: 'Sử dụng để bắt đầu câu hỏi hoặc kết thúc tương tác.', example: 'Excuse me, is this the right way?' },
        ] 
    },
    
    // ID 14: Yêu cầu & Lời mời
    { 
        id: 14, 
        levelTag: 'A2', 
        topic: 'Yêu cầu & Lời mời', 
        vocabulary: [
            { word: 'can', type: 'Modal', meaning: 'có thể' }, { word: 'could', type: 'Modal', meaning: 'có thể (lịch sự)' },
            { word: 'would you like', type: 'Modal', meaning: 'bạn có muốn' }, { word: 'invite', type: 'V', meaning: 'mời' },
            { word: 'accept', type: 'V', meaning: 'chấp nhận' }, { word: 'refuse', type: 'V', meaning: 'từ chối' },
            { word: 'please', type: 'Adv', meaning: 'làm ơn' }, { word: 'lend', type: 'V', meaning: 'cho mượn' },
            { word: 'borrow', type: 'V', meaning: 'mượn' }, { word: 'help', type: 'V/N', meaning: 'giúp đỡ' },
            { word: 'weekend', type: 'N', meaning: 'cuối tuần' }, { word: 'maybe', type: 'Adv', meaning: 'có lẽ' },
            { word: 'sure', type: 'Adj', meaning: 'chắc chắn' }, { word: 'sorry', type: 'Adj', meaning: 'xin lỗi' },
            { word: 'tag question', type: 'N', meaning: 'câu hỏi đuôi' }, { word: 'party', type: 'N', meaning: 'bữa tiệc' },
            { word: 'movie', type: 'N', meaning: 'phim' }, { word: 'tonight', type: 'Adv', meaning: 'tối nay' },
            { word: 'free', type: 'Adj', meaning: 'rảnh' }, { word: 'suggest', type: 'V', meaning: 'đề nghị' },
        ], 
        grammar: [
            { name: 'Câu hỏi đuôi (Tag Questions)', form: 'S + V, trợ động từ ngược + S?', usage: 'Hỏi để xác nhận thông tin hoặc lấy sự đồng tình.', example: 'It\'s cold today, isn\'t it?' },
            { name: 'Lời mời lịch sự (Would you like)', form: 'Would you like to + V / Would you like + Noun?', usage: 'Mời ai đó làm gì hoặc mời đồ ăn/thức uống.', example: 'Would you like to go to the cinema?' },
            { name: 'Yêu cầu lịch sự (Can/Could)', form: 'Can/Could you + V + please?', usage: 'Đề nghị ai đó làm gì đó cho mình.', example: 'Could you please help me with this box?' },
            { name: 'Chấp nhận và từ chối lời mời', form: 'Yes, I\'d love to. / I\'m sorry, I can\'t.', usage: 'Cách đáp lại lời mời một cách lịch sự.', example: 'A: Would you like to join? B: Yes, I\'d love to.' },
            { name: 'Câu mệnh lệnh lịch sự', form: 'Please + V / Don\'t + V + please', usage: 'Ra lệnh hoặc yêu cầu một cách nhẹ nhàng.', example: 'Please sit down. Don\'t forget your keys.' },
        ] 
    },
    
    // ID 15: THỬ THÁCH A1-A2
    { id: 15, levelTag: 'A2', topic: 'THỬ THÁCH A1-A2', vocabulary: [], grammar: [] },

    // ===============================================
    // II. SECTION 2: TRUNG CẤP (B1 - B2)
    // ===============================================

    // ID 16: Quan điểm & Ý kiến
    { 
        id: 16, 
        levelTag: 'B1', 
        topic: 'Quan điểm & Ý kiến', 
        vocabulary: [
            { word: 'opinion', type: 'N', meaning: 'ý kiến' }, { word: 'believe', type: 'V', meaning: 'tin rằng' },
            { word: 'agree', type: 'V', meaning: 'đồng ý' }, { word: 'disagree', type: 'V', meaning: 'không đồng ý' },
            { word: 'viewpoint', type: 'N', meaning: 'quan điểm' }, { word: 'support', type: 'V', meaning: 'ủng hộ' },
            { word: 'claim', type: 'N/V', meaning: 'tuyên bố/khẳng định' }, { word: 'evidence', type: 'N', meaning: 'bằng chứng' },
            { word: 'therefore', type: 'Adv', meaning: 'vì vậy' }, { word: 'however', type: 'Adv', meaning: 'tuy nhiên' },
            { word: 'although', type: 'Conj', meaning: 'mặc dù' }, { word: 'since', type: 'Conj', meaning: 'bởi vì' },
            { word: 'main point', type: 'N', meaning: 'ý chính' }, { word: 'conclusion', type: 'N', meaning: 'kết luận' },
            { word: 'persuade', type: 'V', meaning: 'thuyết phục' }, { word: 'suggest', type: 'V', meaning: 'gợi ý' },
            { word: 'propose', type: 'V', meaning: 'đề xuất' }, { word: 'certainly', type: 'Adv', meaning: 'chắc chắn' },
            { word: 'personally', type: 'Adv', meaning: 'cá nhân mà nói' }, { word: 'from my point of view', type: 'Phrase', meaning: 'theo quan điểm của tôi' },
        ], 
        grammar: [
            { name: 'Câu phức (Complex Sentences)', form: 'Independent Clause + Conjunction + Dependent Clause', usage: 'Nối các ý tưởng chính và phụ thuộc (dùng because, although, when).', example: 'Although it was late, they finished the project.' },
            { name: 'Bày tỏ quan điểm', form: 'I think / I believe / In my opinion...', usage: 'Mở đầu để trình bày ý kiến cá nhân.', example: 'In my opinion, the movie was excellent.' },
            { name: 'Thì Hiện tại Hoàn thành', form: 'S + have/has + V3/ed', usage: 'Diễn tả hành động xảy ra trong quá khứ và còn liên quan đến hiện tại (thường gặp trong thảo luận).', example: 'We have seen many changes in the city lately.' },
            { name: 'Sử dụng Nối câu (However, Therefore)', form: 'Sentence 1. However/Therefore, Sentence 2.', usage: 'Liên kết các câu (tương phản/kết quả).', example: 'He was tired. However, he kept working.' },
            { name: 'So sánh và đối chiếu', form: 'S + am/is/are + not as + Adj + as + Noun', usage: 'So sánh sự tương đồng hoặc khác biệt giữa hai đối tượng.', example: 'Living in the city is not as peaceful as living in the country.' },
        ] 
    },
    
    // ID 17: Môi trường & Thiên nhiên
    { 
        id: 17, 
        levelTag: 'B1', 
        topic: 'Môi trường & Thiên nhiên', 
        vocabulary: [
            { word: 'pollution', type: 'N', meaning: 'ô nhiễm' }, { word: 'environment', type: 'N', meaning: 'môi trường' },
            { word: 'recycle', type: 'V', meaning: 'tái chế' }, { word: 'save', type: 'V', meaning: 'tiết kiệm/cứu' },
            { word: 'global warming', type: 'N', meaning: 'nóng lên toàn cầu' }, { word: 'climate change', type: 'N', meaning: 'biến đổi khí hậu' },
            { word: 'damage', type: 'N/V', meaning: 'thiệt hại' }, { word: 'protect', type: 'V', meaning: 'bảo vệ' },
            { word: 'nature', type: 'N', meaning: 'thiên nhiên' }, { word: 'forest', type: 'N', meaning: 'rừng' },
            { word: 'wildlife', type: 'N', meaning: 'động vật hoang dã' }, { word: 'reduce', type: 'V', meaning: 'giảm thiểu' },
            { word: 'renewable', type: 'Adj', meaning: 'tái tạo được' }, { word: 'energy', type: 'N', meaning: 'năng lượng' },
            { word: 'waste', type: 'N/V', meaning: 'rác thải/lãng phí' }, { word: 'sustainable', type: 'Adj', meaning: 'bền vững' },
            { word: 'litter', type: 'V', meaning: 'xả rác' }, { word: 'cleanup', type: 'N', meaning: 'dọn dẹp' },
            { word: 'conservation', type: 'N', meaning: 'bảo tồn' }, { word: 'emission', type: 'N', meaning: 'khí thải' },
        ], 
        grammar: [
            { name: 'Bị động (Passive Voice)', form: 'S + To Be + V3/ed', usage: 'Nhấn mạnh hành động hoặc đối tượng bị tác động hơn là người thực hiện.', example: 'The forest is protected by the government.' },
            { name: 'Bị động với Modal Verbs', form: 'S + Modal + be + V3/ed', usage: 'Diễn tả khả năng, cần thiết của hành động bị động.', example: 'The plastic must be recycled.' },
            { name: 'Cấu trúc Cause and Effect', form: 'Because of / Due to + Noun Phrase, S + V', usage: 'Trình bày nguyên nhân và kết quả.', example: 'Due to climate change, sea levels are rising.' },
            { name: 'Thì Hiện tại Hoàn thành Tiếp diễn', form: 'S + have/has been + V-ing', usage: 'Hành động bắt đầu trong quá khứ và tiếp diễn đến hiện tại (thường dùng trong bối cảnh môi trường).', example: 'We have been trying to reduce plastic waste for years.' },
            { name: 'Mệnh đề danh từ (That-Clauses)', form: 'It is important that S + V', usage: 'Đưa ra sự thật hoặc tầm quan trọng của vấn đề.', example: 'It is important that everyone recycles.' },
        ] 
    },
    
    // ID 18: Rương B1/1
    { id: 18, levelTag: 'B1', topic: 'Rương B1/1', vocabulary: [], grammar: [] },
    
    // ID 19: Truyền thông & Công nghệ
    { 
        id: 19, 
        levelTag: 'B1', 
        topic: 'Truyền thông & Công nghệ', 
        vocabulary: [
            { word: 'internet', type: 'N', meaning: 'mạng internet' }, { word: 'social media', type: 'N', meaning: 'mạng xã hội' },
            { word: 'smartphone', type: 'N', meaning: 'điện thoại thông minh' }, { word: 'data', type: 'N', meaning: 'dữ liệu' },
            { word: 'access', type: 'V', meaning: 'truy cập' }, { word: 'download', type: 'V', meaning: 'tải xuống' },
            { word: 'upload', type: 'V', meaning: 'tải lên' }, { word: 'privacy', type: 'N', meaning: 'quyền riêng tư' },
            { word: 'device', type: 'N', meaning: 'thiết bị' }, { word: 'software', type: 'N', meaning: 'phần mềm' },
            { word: 'virtual', type: 'Adj', meaning: 'ảo' }, { word: 'communication', type: 'N', meaning: 'giao tiếp' },
            { word: 'broadcast', type: 'V', meaning: 'phát sóng' }, { word: 'headline', type: 'N', meaning: 'tiêu đề báo' },
            { word: 'fake news', type: 'N', meaning: 'tin giả' }, { word: 'algorithm', type: 'N', meaning: 'thuật toán' },
            { word: 'innovate', type: 'V', meaning: 'đổi mới' }, { word: 'monitor', type: 'V', meaning: 'giám sát' },
            { word: 'instant', type: 'Adj', meaning: 'tức thì' }, { word: 'network', type: 'N', meaning: 'mạng lưới' },
        ], 
        grammar: [
            { name: 'Hiện tại Hoàn thành (Tiếp diễn)', form: 'S + have/has been + V-ing', usage: 'Diễn tả hành động bắt đầu trong quá khứ và vẫn tiếp diễn/có ảnh hưởng đến hiện tại.', example: 'We have been using this platform for five years.' },
            { name: 'Mệnh đề quan hệ (Cơ bản)', form: 'Noun + who/which/that + V...', usage: 'Cung cấp thêm thông tin về danh từ.', example: 'The phone that I bought is very fast.' },
            { name: 'Sử dụng Will/May/Could cho dự đoán', form: 'S + will/may/could + V', usage: 'Dự đoán về tương lai của công nghệ.', example: 'AI will change the way we communicate.' },
            { name: 'Sử dụng Modal of deduction (Must, Might)', form: 'S + must/might + V', usage: 'Đưa ra suy luận hoặc khả năng.', example: 'That must be a new update, I haven\'t seen it before.' },
            { name: 'Câu bị động (Thường dùng trong báo cáo)', form: 'S + To Be + V3/ed', usage: 'Nhấn mạnh sự kiện hoặc phát minh.', example: 'The new device was launched last week.' },
        ] 
    },
    
    // ID 20: Du lịch & Văn hóa
    { 
        id: 20, 
        levelTag: 'B1', 
        topic: 'Du lịch & Văn hóa', 
        vocabulary: [
            { word: 'destination', type: 'N', meaning: 'điểm đến' }, { word: 'culture', type: 'N', meaning: 'văn hóa' },
            { word: 'custom', type: 'N', meaning: 'phong tục' }, { word: 'tradition', type: 'N', meaning: 'truyền thống' },
            { word: 'cuisine', type: 'N', meaning: 'ẩm thực' }, { word: 'local', type: 'Adj', meaning: 'địa phương' },
            { word: 'explore', type: 'V', meaning: 'khám phá' }, { word: 'experience', type: 'N/V', meaning: 'trải nghiệm' },
            { word: 'sightseeing', type: 'N', meaning: 'tham quan' }, { word: 'monument', type: 'N', meaning: 'di tích' },
            { word: 'souvenir', type: 'N', meaning: 'quà lưu niệm' }, { word: 'passport', type: 'N', meaning: 'hộ chiếu' },
            { word: 'visa', type: 'N', meaning: 'thị thực' }, { word: 'accommodation', type: 'N', meaning: 'chỗ ở' },
            { word: 'budget', type: 'N', meaning: 'ngân sách' }, { word: 'exchange rate', type: 'N', meaning: 'tỷ giá hối đoái' },
            { word: 'reservation', type: 'N', meaning: 'đặt chỗ' }, { word: 'historic', type: 'Adj', meaning: 'mang tính lịch sử' },
            { word: 'diverse', type: 'Adj', meaning: 'đa dạng' }, { word: 'get lost', type: 'V', meaning: 'bị lạc' },
        ], 
        grammar: [
            { name: 'Mệnh đề quan hệ (Who, Which, That)', form: 'Noun + who/which/that + V/S + V', usage: 'Đưa ra thông tin xác định về địa điểm, người, hoặc vật.', example: 'That is the temple which was built in the 15th century.' },
            { name: 'Câu điều kiện loại 1 (Dự đoán chuyến đi)', form: 'If + Present Simple, Will + V', usage: 'Diễn tả các điều kiện có thể xảy ra trong chuyến đi.', example: 'If we book early, we will save money.' },
            { name: 'Sử dụng Used to', form: 'S + used to + V', usage: 'Mô tả thói quen hoặc tình trạng trong quá khứ đã kết thúc (thường dùng khi nói về truyền thống cũ).', example: 'People used to travel by horse carriage.' },
            { name: 'Sử dụng So/Such', form: 'So + Adj/Adv / Such a/an + Noun', usage: 'Nhấn mạnh sự đặc biệt của trải nghiệm du lịch.', example: 'It was such a beautiful city! The food was so good.' },
            { name: 'Phrasal Verbs du lịch (Check in, Take off)', form: 'V + Adv/Prep', usage: 'Học các cụm động từ thường dùng khi đi du lịch.', example: 'We need to check in our luggage now.' },
        ] 
    },

    // ID 21: Giải quyết vấn đề
    { 
        id: 21, 
        levelTag: 'B1', 
        topic: 'Giải quyết vấn đề', 
        vocabulary: [
            { word: 'problem', type: 'N', meaning: 'vấn đề' }, { word: 'solution', type: 'N', meaning: 'giải pháp' },
            { word: 'difficulty', type: 'N', meaning: 'khó khăn' }, { word: 'resolve', type: 'V', meaning: 'giải quyết' },
            { word: 'suggest', type: 'V', meaning: 'gợi ý' }, { word: 'recommend', type: 'V', meaning: 'đề xuất' },
            { word: 'try', type: 'V', meaning: 'thử' }, { word: 'fix', type: 'V', meaning: 'sửa chữa' },
            { word: 'if only', type: 'Phrase', meaning: 'giá mà' }, { word: 'unless', type: 'Conj', meaning: 'trừ khi' },
            { word: 'handle', type: 'V', meaning: 'xử lý' }, { word: 'consequence', type: 'N', meaning: 'hậu quả' },
            { word: 'strategy', type: 'N', meaning: 'chiến lược' }, { word: 'alternative', type: 'N', meaning: 'lựa chọn thay thế' },
            { word: 'challenge', type: 'N', meaning: 'thử thách' }, { word: 'delay', type: 'V/N', meaning: 'trì hoãn' },
            { word: 'improve', type: 'V', meaning: 'cải thiện' }, { word: 'situation', type: 'N', meaning: 'tình huống' },
            { word: 'feedback', type: 'N', meaning: 'phản hồi' }, { word: 'deal with', type: 'V', meaning: 'giải quyết' },
        ], 
        grammar: [
            { name: 'Câu điều kiện loại 1', form: 'If + Present Simple, Will/Can/Should + V', usage: 'Đưa ra giải pháp cho vấn đề có khả năng xảy ra.', example: 'If you ask the manager, he can help you.' },
            { name: 'Câu điều kiện loại 2', form: 'If + Past Simple, Would/Could + V', usage: 'Thảo luận các giải pháp giả định (không có thật ở hiện tại).', example: 'If I were you, I would talk to him.' },
            { name: 'Sử dụng Unless', form: 'Unless + S + V (khẳng định), S + V', usage: 'Giới thiệu một điều kiện loại trừ (tương đương với If not).', example: 'We won\'t finish the report unless we work overtime.' },
            { name: 'Cấu trúc I suggest/recommend', form: 'I suggest / recommend + V-ing / that S + V', usage: 'Đưa ra đề xuất giải quyết vấn đề.', example: 'I suggest calling the technical support team.' },
            { name: 'Cấu trúc If only / I wish (Giả định)', form: 'If only / I wish + S + Past Simple', usage: 'Diễn tả mong muốn mọi việc khác đi (thường sau khi vấn đề đã xảy ra).', example: 'I wish I had checked the data earlier.' },
        ] 
    },

    // ID 22: Kỹ năng mềm
    { 
        id: 22, 
        levelTag: 'B1', 
        topic: 'Kỹ năng mềm', 
        vocabulary: [
            { word: 'communication', type: 'N', meaning: 'giao tiếp' }, { word: 'teamwork', type: 'N', meaning: 'làm việc nhóm' },
            { word: 'leadership', type: 'N', meaning: 'lãnh đạo' }, { word: 'problem-solving', type: 'N', meaning: 'giải quyết vấn đề' },
            { word: 'creative', type: 'Adj', meaning: 'sáng tạo' }, { word: 'flexible', type: 'Adj', meaning: 'linh hoạt' },
            { word: 'organization', type: 'N', meaning: 'tổ chức' }, { word: 'responsible', type: 'Adj', meaning: 'có trách nhiệm' },
            { word: 'punctual', type: 'Adj', meaning: 'đúng giờ' }, { word: 'manage', type: 'V', meaning: 'quản lý' },
            { word: 'negotiate', type: 'V', meaning: 'đàm phán' }, { word: 'listen', type: 'V', meaning: 'lắng nghe' },
            { word: 'confident', type: 'Adj', meaning: 'tự tin' }, { word: 'motivate', type: 'V', meaning: 'động viên' },
            { word: 'adapt', type: 'V', meaning: 'thích nghi' }, { word: 'deadline', type: 'N', meaning: 'hạn chót' },
            { word: 'collaborate', type: 'V', meaning: 'hợp tác' }, { word: 'skill', type: 'N', meaning: 'kỹ năng' },
            { word: 'strength', type: 'N', meaning: 'điểm mạnh' }, { word: 'weakness', type: 'N', meaning: 'điểm yếu' },
        ], 
        grammar: [
            { name: 'Gerunds (Danh động từ)', form: 'V-ing', usage: 'Sử dụng làm chủ ngữ, tân ngữ, hoặc sau giới từ.', example: 'Working in a team requires patience. He is good at managing time.' },
            { name: 'Infinitives (Động từ nguyên mẫu có/không To)', form: 'to + V / V', usage: 'Sử dụng sau một số động từ (want, need, decide) hoặc để chỉ mục đích.', example: 'I want to improve my speaking skills.' },
            { name: 'Cấu trúc It is + Adj + to V', form: 'It is + Adj + to V', usage: 'Nhận xét về hành động hoặc tình huống.', example: 'It is important to be punctual.' },
            { name: 'Cấu trúc Be able to', form: 'S + To Be + able to + V', usage: 'Diễn tả khả năng làm gì (thay thế cho Can/Could ở các thì khác).', example: 'She is able to manage the team well.' },
            { name: 'Miêu tả điểm mạnh/yếu', form: 'S + am/is/are + good/bad at + V-ing', usage: 'Đánh giá khả năng về một kỹ năng.', example: 'He is good at negotiating.' },
        ] 
    },
    
    // ID 23: Tranh luận học thuật
    { 
        id: 23, 
        levelTag: 'B2', 
        topic: 'Tranh luận học thuật', 
        vocabulary: [
            { word: 'hypothesis', type: 'N', meaning: 'giả thuyết' }, { word: 'research', type: 'N/V', meaning: 'nghiên cứu' },
            { word: 'validate', type: 'V', meaning: 'xác thực' }, { word: 'literature', type: 'N', meaning: 'tài liệu/văn học' },
            { word: 'methodology', type: 'N', meaning: 'phương pháp luận' }, { word: 'findings', type: 'N', meaning: 'kết quả nghiên cứu' },
            { word: 'analysis', type: 'N', meaning: 'phân tích' }, { word: 'argument', type: 'N', meaning: 'luận điểm' },
            { word: 'counter-argument', type: 'N', meaning: 'phản biện' }, { word: 'citation', type: 'N', meaning: 'trích dẫn' },
            { word: 'peer-reviewed', type: 'Adj', meaning: 'được phản biện' }, { word: 'academic', type: 'Adj', meaning: 'học thuật' },
            { word: 'critique', type: 'N/V', meaning: 'phê bình' }, { word: 'objective', type: 'Adj', meaning: 'khách quan' },
            { word: 'subjective', type: 'Adj', meaning: 'chủ quan' }, { word: 'dispute', type: 'V', meaning: 'tranh cãi' },
            { word: 'establish', type: 'V', meaning: 'thiết lập/chứng minh' }, { word: 'premise', type: 'N', meaning: 'tiền đề' },
            { word: 'evidence', type: 'N', meaning: 'bằng chứng' }, { word: 'conclusion', type: 'N', meaning: 'kết luận' },
        ], 
        grammar: [
            { name: 'Quá khứ Hoàn thành', form: 'S + had + V3/ed', usage: 'Diễn tả hành động xảy ra trước một hành động khác trong quá khứ (thường dùng trong bối cảnh tường thuật nghiên cứu).', example: 'The researchers had collected the data before the ethical review began.' },
            { name: 'Mệnh đề quan hệ xác định/không xác định', form: 'N, which/who, S + V', usage: 'Đưa ra thông tin bổ sung, không cần thiết cho ý nghĩa chính (dùng dấu phẩy).', example: 'The article, which was peer-reviewed, contained critical findings.' },
            { name: 'Ngôn ngữ tranh luận (Linking words)', form: 'Furthermore, Moreover, In contrast, Despite...', usage: 'Liên kết các ý tưởng phức tạp, tăng tính logic.', example: 'Despite the strong evidence, the theory remains controversial.' },
            { name: 'Động từ Report (Reported Speech)', form: 'S + stated/argued/claimed + that S + V (lùi thì)', usage: 'Tường thuật lại kết quả hoặc tuyên bố của người khác.', example: 'The study claimed that the results were not statistically significant.' },
            { name: 'Sử dụng Modal of Certainty (Cannot, Must)', form: 'S + must/cannot + have + V3/ed', usage: 'Đưa ra suy luận mạnh mẽ về các sự kiện trong quá khứ.', example: 'The hypothesis cannot have been valid, given the flawed methodology.' },
        ] 
    },
    
    // ID 24: Kinh doanh & Tài chính
    { 
        id: 24, 
        levelTag: 'B2', 
        topic: 'Kinh doanh & Tài chính', 
        vocabulary: [
            { word: 'market share', type: 'N', meaning: 'thị phần' }, { word: 'profit', type: 'N', meaning: 'lợi nhuận' },
            { word: 'revenue', type: 'N', meaning: 'doanh thu' }, { word: 'investment', type: 'N', meaning: 'đầu tư' },
            { word: 'strategy', type: 'N', meaning: 'chiến lược' }, { word: 'negotiation', type: 'N', meaning: 'đàm phán' },
            { word: 'loan', type: 'N', meaning: 'khoản vay' }, { word: 'interest rate', type: 'N', meaning: 'lãi suất' },
            { word: 'merger', type: 'N', meaning: 'sáp nhập' }, { word: 'acquisition', type: 'N', meaning: 'mua lại' },
            { word: 'customer', type: 'N', meaning: 'khách hàng' }, { word: 'supplier', type: 'N', meaning: 'nhà cung cấp' },
            { word: 'contract', type: 'N', meaning: 'hợp đồng' }, { word: 'budgeting', type: 'N', meaning: 'lập ngân sách' },
            { word: 'stock', type: 'N', meaning: 'cổ phiếu' }, { word: 'dividend', type: 'N', meaning: 'cổ tức' },
            { word: 'forecast', type: 'V/N', meaning: 'dự báo' }, { word: 'efficiency', type: 'N', meaning: 'hiệu suất' },
            { word: 'liability', type: 'N', meaning: 'trách nhiệm/nợ phải trả' }, { word: 'asset', type: 'N', meaning: 'tài sản' },
        ], 
        grammar: [
            { name: 'Câu tường thuật (Reported Speech)', form: 'S + said/told/announced + that S + V (lùi thì)', usage: 'Tường thuật lại lời nói, thông báo hoặc dữ liệu kinh doanh.', example: 'The CEO announced that the company was going to merge.' },
            { name: 'Thì Tương lai Hoàn thành', form: 'S + will have + V3/ed', usage: 'Diễn tả một hành động sẽ hoàn thành trước một mốc thời gian trong tương lai (thường dùng trong dự báo).', example: 'By next quarter, we will have reached our revenue target.' },
            { name: 'Giả định với I wish (Regret)', form: 'I wish + S + had + V3/ed', usage: 'Diễn tả sự hối tiếc về một quyết định kinh doanh trong quá khứ.', example: 'I wish we had invested in that project last year.' },
            { name: 'Ngôn ngữ đề xuất và điều kiện', form: 'I suggest / If we do X, then Y will happen', usage: 'Đưa ra đề xuất hoặc phân tích rủi ro trong đàm phán.', example: 'I suggest we increase the budget. If we don\'t sign the contract, we will lose the client.' },
            { name: 'Sử dụng Nominalization', form: 'Động từ/Tính từ -> Danh từ (e.g., improve -> improvement)', usage: 'Làm cho văn phong báo cáo kinh doanh trở nên học thuật và cô đọng hơn.', example: 'The efficiency (from efficient) of the new system led to great improvements (from improving).' },
        ] 
    },
    
    // ID 25: Rương B2/1
    { id: 25, levelTag: 'B2', topic: 'Rương B2/1', vocabulary: [], grammar: [] },

    // ID 26: Phân tích phim ảnh
    { 
        id: 26, 
        levelTag: 'B2', 
        topic: 'Phân tích phim ảnh', 
        vocabulary: [
            { word: 'plot', type: 'N', meaning: 'cốt truyện' }, { word: 'character', type: 'N', meaning: 'nhân vật' },
            { word: 'theme', type: 'N', meaning: 'chủ đề' }, { word: 'setting', type: 'N', meaning: 'bối cảnh' },
            { word: 'director', type: 'N', meaning: 'đạo diễn' }, { word: 'cinematography', type: 'N', meaning: 'nghệ thuật quay phim' },
            { word: 'climax', type: 'N', meaning: 'cao trào' }, { word: 'symbolism', type: 'N', meaning: 'biểu tượng' },
            { word: 'acting', type: 'N', meaning: 'diễn xuất' }, { word: 'soundtrack', type: 'N', meaning: 'nhạc phim' },
            { word: 'critique', type: 'N/V', meaning: 'phê bình' }, { word: 'narrative', type: 'N', meaning: 'tường thuật' },
            { word: 'genre', type: 'N', meaning: 'thể loại' }, { word: 'perspective', type: 'N', meaning: 'góc nhìn' },
            { word: 'portray', type: 'V', meaning: 'miêu tả' }, { word: 'compelling', type: 'Adj', meaning: 'hấp dẫn' },
            { word: 'masterpiece', type: 'N', meaning: 'kiệt tác' }, { word: 'flashback', type: 'N', meaning: 'hồi tưởng' },
            { word: 'reveal', type: 'V', meaning: 'tiết lộ' }, { word: 'visuals', type: 'N', meaning: 'hình ảnh' },
        ], 
        grammar: [
            { name: 'Mệnh đề quan hệ rút gọn (Reduced Relative Clauses)', form: 'N + V-ing/V3/ed', usage: 'Rút gọn mệnh đề quan hệ để làm câu gọn hơn, thường dùng trong văn viết/phân tích.', example: 'The actor playing the main role was phenomenal.' },
            { name: 'Cấu trúc It is said that...', form: 'It is said / thought / believed that + S + V', usage: 'Bày tỏ quan điểm chung hoặc tin đồn (thường dùng trong phê bình phim ảnh).', example: 'It is widely believed that the ending was controversial.' },
            { name: 'Phân từ hiện tại/quá khứ làm tính từ', form: 'V-ing / V3/ed + Noun', usage: 'Diễn tả cảm xúc hoặc nguyên nhân của cảm xúc.', example: 'a confusing plot (cốt truyện gây bối rối), a shocking reveal (tiết lộ gây sốc).' },
            { name: 'Cấu trúc Be worth V-ing', form: 'S + To Be + worth + V-ing', usage: 'Đưa ra đánh giá rằng điều gì đó xứng đáng làm.', example: 'The movie is definitely worth watching.' },
            { name: 'Sử dụng Modal of Obligation (Should have V3/ed)', form: 'S + should have + V3/ed', usage: 'Phê bình những gì đạo diễn/nhân vật lẽ ra nên làm.', example: 'The director should have developed the character more deeply.' },
        ] 
    },

    // ID 27: Viết báo cáo chuyên nghiệp
    { 
        id: 27, 
        levelTag: 'B2', 
        topic: 'Viết báo cáo chuyên nghiệp', 
        vocabulary: [
            { word: 'summary', type: 'N', meaning: 'tóm tắt' }, { word: 'objective', type: 'N', meaning: 'mục tiêu' },
            { word: 'recommendation', type: 'N', meaning: 'khuyến nghị' }, { word: 'data', type: 'N', meaning: 'dữ liệu' },
            { word: 'analysis', type: 'N', meaning: 'phân tích' }, { word: 'appendix', type: 'N', meaning: 'phụ lục' },
            { word: 'confidential', type: 'Adj', meaning: 'bí mật' }, { word: 'consequently', type: 'Adv', meaning: 'kết quả là' },
            { word: 'furthermore', type: 'Adv', meaning: 'hơn nữa' }, { word: 'preliminary', type: 'Adj', meaning: 'sơ bộ' },
            { word: 'evaluate', type: 'V', meaning: 'đánh giá' }, { word: 'implement', type: 'V', meaning: 'thực hiện' },
            { word: 'finding', type: 'N', meaning: 'phát hiện/kết quả' }, { word: 'scope', type: 'N', meaning: 'phạm vi' },
            { word: 'conclusion', type: 'N', meaning: 'kết luận' }, { word: 'justification', type: 'N', meaning: 'sự biện minh' },
            { word: 'feasible', type: 'Adj', meaning: 'khả thi' }, { word: 'proposal', type: 'N', meaning: 'đề xuất' },
            { word: 'accuracy', type: 'N', meaning: 'độ chính xác' }, { word: 'methodology', type: 'N', meaning: 'phương pháp luận' },
        ], 
        grammar: [
            { name: 'Đảo ngữ (Inversions)', form: 'Negative Adv. + V + S', usage: 'Nhấn mạnh một ý tiêu cực, làm cho văn phong trang trọng hơn (thường dùng trong mở đầu báo cáo).', example: 'Not only was the data collected, but it was also analyzed.' },
            { name: 'Ngôn ngữ bị động trang trọng', form: 'It is suggested/recommended that...', usage: 'Dùng để đưa ra khuyến nghị một cách khách quan, không chỉ đích danh chủ thể.', example: 'It is recommended that the new system be implemented immediately.' },
            { name: 'Sử dụng cụm danh từ dài', form: 'Adj + Adj + Noun', usage: 'Làm cho thông tin trở nên cô đọng và chuyên nghiệp.', example: 'the proposed market development strategy (chiến lược phát triển thị trường được đề xuất).' },
            { name: 'Ngôn ngữ nối câu formal', form: 'Moreover, Nevertheless, Consequently', usage: 'Liên kết các phần của báo cáo một cách logic và trang trọng.', example: 'The budget was exceeded. Consequently, the project was paused.' },
            { name: 'Cấu trúc As a result of...', form: 'As a result of + Noun, S + V', usage: 'Nêu kết quả của một hành động/phân tích.', example: 'As a result of our analysis, we recommend reducing expenditure.' },
        ] 
    },

    // ID 28: Thuyết trình hiệu quả
    { 
        id: 28, 
        levelTag: 'B2', 
        topic: 'Thuyết trình hiệu quả', 
        vocabulary: [
            { word: 'audience', type: 'N', meaning: 'khán giả' }, { word: 'visual aid', type: 'N', meaning: 'hỗ trợ trực quan' },
            { word: 'transition', type: 'N', meaning: 'chuyển tiếp' }, { word: 'engage', type: 'V', meaning: 'thu hút' },
            { word: 'summary', type: 'N', meaning: 'tóm tắt' }, { word: 'fluent', type: 'Adj', meaning: 'trôi chảy' },
            { word: 'pace', type: 'N', meaning: 'tốc độ' }, { word: 'tone', type: 'N', meaning: 'giọng điệu' },
            { word: 'clarity', type: 'N', meaning: 'sự rõ ràng' }, { word: 'feedback', type: 'N', meaning: 'phản hồi' },
            { word: 'outline', type: 'N/V', meaning: 'dàn ý/vạch ra' }, { word: 'presenter', type: 'N', meaning: 'người thuyết trình' },
            { word: 'main argument', type: 'N', meaning: 'luận điểm chính' }, { word: 'key takeaway', type: 'N', meaning: 'điểm mấu chốt' },
            { word: 'emphasize', type: 'V', meaning: 'nhấn mạnh' }, { word: 'interrupt', type: 'V', meaning: 'ngắt lời' },
            { word: 'body language', type: 'N', meaning: 'ngôn ngữ cơ thể' }, { word: 'conclude', type: 'V', meaning: 'kết luận' },
            { word: 'elaborate', type: 'V', meaning: 'trình bày chi tiết' }, { word: 'clarify', type: 'V', meaning: 'làm rõ' },
        ], 
        grammar: [
            { name: 'Sử dụng Modal Verbs (Can, Could, May, Must)', form: 'S + Modal + V', usage: 'Dùng để xin phép, bày tỏ khả năng, hoặc đưa ra sự chắc chắn (trong phần Q&A).', example: 'We can discuss this further. May I ask a question?' },
            { name: 'Ngôn ngữ chuyển ý (Transition phrases)', form: 'Firstly, Furthermore, In conclusion, Now let\'s turn to...', usage: 'Làm cho bài thuyết trình trôi chảy và dễ theo dõi.', example: 'In conclusion, the data clearly supports our findings.' },
            { name: 'Câu hỏi tu từ (Rhetorical Questions)', form: 'Question form', usage: 'Thu hút sự chú ý của khán giả và làm nổi bật luận điểm.', example: 'But what does this data actually mean for our future?' },
            { name: 'Ngôn ngữ nhấn mạnh', form: 'It is clear that..., What is important is...', usage: 'Làm nổi bật luận điểm chính hoặc thông tin quan trọng.', example: 'What is important is the commitment from the whole team.' },
            { name: 'Bị động (Passive Voice) để duy trì tính khách quan', form: 'S + To Be + V3/ed', usage: 'Sử dụng khi không muốn chỉ đích danh người thực hiện hành động.', example: 'The proposal was approved by the board.' },
        ] 
    },

    // ID 29: Lịch sử & Xã hội
    { 
        id: 29, 
        levelTag: 'B2', 
        topic: 'Lịch sử & Xã hội', 
        vocabulary: [
            { word: 'era', type: 'N', meaning: 'kỷ nguyên' }, { word: 'dynasty', type: 'N', meaning: 'triều đại' },
            { word: 'ancient', type: 'Adj', meaning: 'cổ đại' }, { word: 'revolution', type: 'N', meaning: 'cách mạng' },
            { word: 'colonialism', type: 'N', meaning: 'chủ nghĩa thực dân' }, { word: 'migration', type: 'N', meaning: 'di cư' },
            { word: 'society', type: 'N', meaning: 'xã hội' }, { word: 'custom', type: 'N', meaning: 'phong tục' },
            { word: 'tradition', type: 'N', meaning: 'truyền thống' }, { word: 'values', type: 'N', meaning: 'giá trị' },
            { word: 'equality', type: 'N', meaning: 'bình đẳng' }, { word: 'justice', type: 'N', meaning: 'công lý' },
            { word: 'democracy', type: 'N', meaning: 'dân chủ' }, { word: 'conflict', type: 'N', meaning: 'xung đột' },
            { word: 'treaty', type: 'N', meaning: 'hiệp ước' }, { word: 'influence', type: 'N/V', meaning: 'ảnh hưởng' },
            { word: 'contemporary', type: 'Adj', meaning: 'đương đại' }, { word: 'heritage', type: 'N', meaning: 'di sản' },
            { word: 'urbanization', type: 'N', meaning: 'đô thị hóa' }, { word: 'generation', type: 'N', meaning: 'thế hệ' },
        ], 
        grammar: [
            { name: 'Đại từ sở hữu', form: 'mine, yours, his, hers, ours, theirs', usage: 'Thay thế cho tính từ sở hữu + danh từ (tránh lặp từ).', example: 'My culture is different from theirs.' },
            { name: 'Thì Hiện tại Hoàn thành (Dùng với Since/For)', form: 'S + have/has + V3/ed + since/for...', usage: 'Diễn tả khoảng thời gian một sự kiện lịch sử/xã hội đã kéo dài.', example: 'The country has been independent since 1945.' },
            { name: 'Cấu trúc So + Aux + S', form: 'So + Trợ động từ + S', usage: 'Đồng tình với một nhận định khẳng định đã được nói trước đó (sử dụng trong thảo luận).', example: 'A: I love learning about history. B: So do I.' },
            { name: 'Mệnh đề danh từ (Wh-clauses)', form: 'Wh-word + S + V', usage: 'Sử dụng để nói về những gì được biết hoặc không được biết (thường dùng trong nghiên cứu lịch sử).', example: 'What we know about the ancient era is limited.' },
            { name: 'Sử dụng Unless / Provided that', form: 'Unless / Provided that + S + V', usage: 'Đặt điều kiện trong bối cảnh xã hội hoặc chính trị.', example: 'The law will not change unless there is strong public pressure.' },
        ] 
    },
    
    // ID 30: THỬ THÁCH B1-B2
    { id: 30, levelTag: 'B2', topic: 'THỬ THÁCH B1-B2', vocabulary: [], grammar: [] },

    // ===============================================
    // III. SECTION 3: NÂNG CAO (C1 - C2)
    // ===============================================

    // ID 31: Văn hóa học thuật
    { 
        id: 31, 
        levelTag: 'C1', 
        topic: 'Văn hóa học thuật', 
        vocabulary: [
            { word: 'discourse', type: 'N', meaning: 'diễn ngôn' }, { word: 'paradigm', type: 'N', meaning: 'mô hình/hệ tư tưởng' },
            { word: 'rhetoric', type: 'N', meaning: 'nghệ thuật hùng biện' }, { word: 'scrutinize', type: 'V', meaning: 'xem xét kỹ lưỡng' },
            { word: 'consensus', type: 'N', meaning: 'sự đồng thuận' }, { word: 'imply', type: 'V', meaning: 'ngụ ý' },
            { word: 'infer', type: 'V', meaning: 'suy luận' }, { word: 'empirical', type: 'Adj', meaning: 'thực nghiệm' },
            { word: 'theoretical', type: 'Adj', meaning: 'lý thuyết' }, { word: 'disseminate', type: 'V', meaning: 'truyền bá' },
            { word: 'plagiarism', type: 'N', meaning: 'đạo văn' }, { word: 'methodology', type: 'N', meaning: 'phương pháp luận' },
            { word: 'substantiate', type: 'V', meaning: 'chứng minh' }, { word: 'validate', type: 'V', meaning: 'xác nhận' },
            { word: 'peer-review', type: 'N', meaning: 'phản biện đồng cấp' }, { word: 'hypothesis', type: 'N', meaning: 'giả thuyết' },
            { word: 'variable', type: 'N', meaning: 'biến số' }, { word: 'qualitative', type: 'Adj', meaning: 'định tính' },
            { word: 'quantitative', type: 'Adj', meaning: 'định lượng' }, { word: 'rigorous', type: 'Adj', meaning: 'chặt chẽ' },
        ], 
        grammar: [
            { name: 'Câu điều kiện hỗn hợp (Mixed Conditionals)', form: 'If + Past Perfect, would + V (now)', usage: 'Nối điều kiện quá khứ với kết quả hiện tại, hoặc ngược lại.', example: 'If I had studied harder (Past), I would be a doctor now (Present).' },
            { name: 'Cấu trúc Inversion (Never before)', form: 'Negative Adv. + Auxiliary V + S + V', usage: 'Nhấn mạnh sự đảo ngược hoặc độc đáo trong nghiên cứu.', example: 'Never before have we seen such compelling evidence.' },
            { name: 'Giả định với Should/Would (Lý thuyết)', form: 'It is advised that S + should/V (bare)', usage: 'Đưa ra yêu cầu hoặc lời khuyên trang trọng trong văn viết học thuật.', example: 'It is essential that the data be verified.' },
            { name: 'Sử dụng Passive Voice (Report/Methodology)', form: 'Has been V3/ed (Present Perfect Passive)', usage: 'Miêu tả quy trình nghiên cứu hoặc kết quả mà không tập trung vào người thực hiện.', example: 'The primary findings have been disseminated globally.' },
            { name: 'Ngôn ngữ suy luận (Must have V3/ed)', form: 'S + must have + V3/ed', usage: 'Đưa ra suy luận có tính logic cao về sự kiện trong quá khứ.', example: 'The results must have been flawed due to the lack of control.' },
        ] 
    },
    
    // ID 32: Chính trị & Luật pháp
    { 
        id: 32, 
        levelTag: 'C1', 
        topic: 'Chính trị & Luật pháp', 
        vocabulary: [
            { word: 'legislation', type: 'N', meaning: 'luật pháp' }, { word: 'policy', type: 'N', meaning: 'chính sách' },
            { word: 'democracy', type: 'N', meaning: 'dân chủ' }, { word: 'election', type: 'N', meaning: 'bầu cử' },
            { word: 'jurisdiction', type: 'N', meaning: 'thẩm quyền' }, { word: 'amendment', type: 'N', meaning: 'tu chính án' },
            { word: 'constitution', type: 'N', meaning: 'hiến pháp' }, { word: 'ratify', type: 'V', meaning: 'phê chuẩn' },
            { word: 'sanction', type: 'N/V', meaning: 'lệnh trừng phạt' }, { word: 'diplomacy', type: 'N', meaning: 'ngoại giao' },
            { word: 'coalition', type: 'N', meaning: 'liên minh' }, { word: 'referendum', type: 'N', meaning: 'trưng cầu dân ý' },
            { word: 'impeach', type: 'V', meaning: 'luận tội' }, { word: 'sovereignty', type: 'N', meaning: 'chủ quyền' },
            { word: 'mandate', type: 'N', meaning: 'ủy nhiệm' }, { word: 'civil rights', type: 'N', meaning: 'quyền công dân' },
            { word: 'precedent', type: 'N', meaning: 'tiền lệ' }, { word: 'prosecute', type: 'V', meaning: 'truy tố' },
            { word: 'detention', type: 'N', meaning: 'giam giữ' }, { word: 'reform', type: 'N/V', meaning: 'cải cách' },
        ], 
        grammar: [
            { name: 'Câu chẻ (Cleft Sentences)', form: 'It is/was + Noun + that/who + V...', usage: 'Nhấn mạnh một phần cụ thể của câu (như tác nhân hoặc nguyên nhân).', example: 'It was the new legislation that caused the controversy.' },
            { name: 'Sử dụng Giả định (Subjunctive)', form: 'V/Adj yêu cầu (suggest, essential) + that + S + V (nguyên mẫu)', usage: 'Diễn tả sự cần thiết, yêu cầu (rất trang trọng).', example: 'The policy requires that all citizens obey the law.' },
            { name: 'Giảm mệnh đề danh từ', form: 'The decision to V / The proposal that...', usage: 'Rút gọn câu để tạo văn phong báo cáo pháp luật/chính trị cô đọng.', example: 'The decision to ratify the treaty was final.' },
            { name: 'Ngôn ngữ tường thuật trang trọng', form: 'It has been asserted / claimed / stipulated that...', usage: 'Trích dẫn hoặc tường thuật lại các điều khoản hoặc tuyên bố chính trị.', example: 'It has been stipulated that the amendments will take effect immediately.' },
            { name: 'Cấu trúc Giới từ + Whom/Which (Formal)', form: 'Preposition + whom/which', usage: 'Sử dụng trong mệnh đề quan hệ trang trọng (Formal Relative Clauses).', example: 'The official, with whom I spoke, denied the claim.' },
        ] 
    },

    // ID 33: Rương C1/1
    { id: 33, levelTag: 'C1', topic: 'Rương C1/1', vocabulary: [], grammar: [] },

    // ID 34: Nghệ thuật & Thiết kế
    { 
        id: 34, 
        levelTag: 'C1', 
        topic: 'Nghệ thuật & Thiết kế', 
        vocabulary: [
            { word: 'aesthetic', type: 'N/Adj', meaning: 'thẩm mỹ' }, { word: 'palette', type: 'N', meaning: 'bảng màu' },
            { word: 'composition', type: 'N', meaning: 'bố cục' }, { word: 'medium', type: 'N', meaning: 'chất liệu/phương tiện' },
            { word: 'abstract', type: 'Adj', meaning: 'trừu tượng' }, { word: 'represent', type: 'V', meaning: 'đại diện/thể hiện' },
            { word: 'sculpture', type: 'N', meaning: 'tác phẩm điêu khắc' }, { word: 'masterpiece', type: 'N', meaning: 'kiệt tác' },
            { word: 'curate', type: 'V', meaning: 'tổ chức (triển lãm)' }, { word: 'exhibition', type: 'N', meaning: 'triển lãm' },
            { word: 'critique', type: 'N/V', meaning: 'phê bình' }, { word: 'genre', type: 'N', meaning: 'thể loại' },
            { word: 'subtle', type: 'Adj', meaning: 'tinh tế/khó nhận thấy' }, { word: 'vibrant', type: 'Adj', meaning: 'sống động' },
            { word: 'texture', type: 'N', meaning: 'kết cấu' }, { word: 'contrast', type: 'N/V', meaning: 'sự tương phản' },
            { word: 'motif', type: 'N', meaning: 'họa tiết/chủ đề chính' }, { word: 'conceptual', type: 'Adj', meaning: 'mang tính khái niệm' },
            { word: 'expressive', type: 'Adj', meaning: 'giàu tính biểu cảm' }, { word: 'innovative', type: 'Adj', meaning: 'đổi mới' },
        ], 
        grammar: [
            { name: 'Ngôn ngữ formal vs informal', form: 'Formal: Hence, Thus, Moreover / Informal: So, Also, Plus', usage: 'Phân biệt giọng điệu khi viết phê bình nghệ thuật (formal) và nói chuyện hàng ngày (informal).', example: 'Formal: The artist\'s technique is highly innovative. Informal: I love how the colors pop.' },
            { name: 'Giảm mệnh đề tính từ (Rút gọn V-ing)', form: 'The artwork displaying [V-ing]...', usage: 'Làm câu miêu tả trở nên cô đọng và mạnh mẽ hơn.', example: 'The painting depicting the war is truly moving.' },
            { name: 'Cấu trúc As if / As though', form: 'S + V + as if/as though + S + V (giả định)', usage: 'Mô tả cảm giác hoặc ấn tượng mà tác phẩm mang lại.', example: 'The colors are arranged as if they were dancing.' },
            { name: 'Ngôn ngữ đánh giá (Critical Language)', form: 'The use of X suggests / implies / conveys Y', usage: 'Sử dụng động từ học thuật để phân tích tác phẩm.', example: 'The dark palette conveys a sense of melancholy.' },
            { name: 'Câu ghép/phức dài', form: 'Sentence, coordinating conjunction, Sentence', usage: 'Sử dụng các câu phức để kết nối nhiều nhận xét hoặc phân tích sâu.', example: 'The composition is complex, and the choice of medium is brilliant.' },
        ] 
    },

    // ID 35: Khoa học & Nghiên cứu
    { 
        id: 35, 
        levelTag: 'C1', 
        topic: 'Khoa học & Nghiên cứu', 
        vocabulary: [
            { word: 'experiment', type: 'N/V', meaning: 'thí nghiệm' }, { word: 'data', type: 'N', meaning: 'dữ liệu' },
            { word: 'analysis', type: 'N', meaning: 'phân tích' }, { word: 'hypothesis', type: 'N', meaning: 'giả thuyết' },
            { word: 'variable', type: 'N', meaning: 'biến số' }, { word: 'confirm', type: 'V', meaning: 'xác nhận' },
            { word: 'refute', type: 'V', meaning: 'bác bỏ' }, { word: 'theory', type: 'N', meaning: 'lý thuyết' },
            { word: 'methodology', type: 'N', meaning: 'phương pháp luận' }, { word: 'validate', type: 'V', meaning: 'xác thực' },
            { word: 'implicate', type: 'V', meaning: 'ám chỉ/liên quan' }, { word: 'correlation', type: 'N', meaning: 'sự tương quan' },
            { word: 'empirical', type: 'Adj', meaning: 'thực nghiệm' }, { word: 'peer-review', type: 'N', meaning: 'phản biện đồng cấp' },
            { word: 'discrepancy', type: 'N', meaning: 'sự khác biệt/mâu thuẫn' }, { word: 'derive', type: 'V', meaning: 'thu được/bắt nguồn từ' },
            { word: 'protocol', type: 'N', meaning: 'nghi thức/quy trình' }, { word: 'evidence', type: 'N', meaning: 'bằng chứng' },
            { word: 'significant', type: 'Adj', meaning: 'đáng kể' }, { word: 'implication', type: 'N', meaning: 'hàm ý' },
        ], 
        grammar: [
            { name: 'Giả định (Subjunctive)', form: 'It is imperative that S + V (bare)', usage: 'Sử dụng để nhấn mạnh sự cần thiết của một hành động (thường trong báo cáo khoa học).', example: 'It is crucial that the experiment be replicated.' },
            { name: 'Cấu trúc Passive Voice (Nâng cao)', form: 'It is hypothesized that... / The data was analyzed using...', usage: 'Duy trì giọng văn khách quan, tập trung vào quy trình và kết quả.', example: 'It has been observed that the variables are strongly correlated.' },
            { name: 'Giảm mệnh đề danh từ', form: 'The tendency for X to V', usage: 'Sử dụng danh từ hóa (Nominalization) để viết cô đọng hơn.', example: 'The failure to confirm the hypothesis led to further investigation.' },
            { name: 'Ngôn ngữ suy luận và khả năng', form: 'Could have been / Might have led to', usage: 'Thảo luận về các kết quả hoặc khả năng xảy ra trong quá khứ.', example: 'The initial findings might have been misleading.' },
            { name: 'Giới từ cho nghiên cứu', form: 'In light of / With regard to / On the basis of', usage: 'Giới thiệu các phần của nghiên cứu hoặc kết luận.', example: 'In light of these findings, we must adjust the protocol.' },
        ] 
    },

    // ID 36: Phân tích triết học
    { 
        id: 36, 
        levelTag: 'C1', 
        topic: 'Phân tích triết học', 
        vocabulary: [
            { word: 'existence', type: 'N', meaning: 'sự tồn tại' }, { word: 'consciousness', type: 'N', meaning: 'ý thức' },
            { word: 'epistemology', type: 'N', meaning: 'nhận thức luận' }, { word: 'metaphysics', type: 'N', meaning: 'siêu hình học' },
            { word: 'ethics', type: 'N', meaning: 'đạo đức học' }, { word: 'absurdity', type: 'N', meaning: 'sự phi lý' },
            { word: 'free will', type: 'N', meaning: 'ý chí tự do' }, { word: 'determinism', type: 'N', meaning: 'thuyết định mệnh' },
            { word: 'subjectivity', type: 'N', meaning: 'tính chủ quan' }, { word: 'objective truth', type: 'N', meaning: 'chân lý khách quan' },
            { word: 'perceive', type: 'V', meaning: 'nhận thức' }, { word: 'contemplate', type: 'V', meaning: 'chiêm nghiệm' },
            { word: 'paradox', type: 'N', meaning: 'nghịch lý' }, { word: 'inherent', type: 'Adj', meaning: 'vốn có' },
            { word: 'essence', type: 'N', meaning: 'bản chất' }, { word: 'rationality', type: 'N', meaning: 'tính hợp lý' },
            { word: 'empirical', type: 'Adj', meaning: 'kinh nghiệm' }, { word: 'skepticism', type: 'N', meaning: 'chủ nghĩa hoài nghi' },
            { word: 'existential', type: 'Adj', meaning: 'hiện sinh' }, { word: 'deconstruct', type: 'V', meaning: 'giải cấu trúc' },
        ], 
        grammar: [
            { name: 'Liên từ phức tạp (Non-standard Conjunctions)', form: 'Be that as it may / Notwithstanding / Albeit', usage: 'Sử dụng các liên từ rất trang trọng để nối các mệnh đề triết học phức tạp.', example: 'Albeit a challenging concept, the philosophy is compelling.' },
            { name: 'Cấu trúc Giả định với Would/Should/Might', form: 'It would seem that... / One might argue that...', usage: 'Đưa ra các luận điểm giả định hoặc suy đoán.', example: 'It would seem that consciousness precedes existence.' },
            { name: 'Cấu trúc V-ing làm chủ ngữ (Gerunds)', form: 'V-ing + V...', usage: 'Làm cho chủ đề thảo luận trừu tượng hơn.', example: 'Contemplating morality is a fundamental human trait.' },
            { name: 'Giảm mệnh đề trạng ngữ (Reduced Adverbial Clauses)', form: 'After realizing..., Before concluding...', usage: 'Làm câu trở nên cô đọng, thường dùng trong văn viết triết học.', example: 'After contemplating the inherent meaninglessness, one achieves true freedom.' },
            { name: 'Ngôn ngữ nhấn mạnh (Emphasis/Exclusion)', form: 'Not only... but also...', usage: 'Nhấn mạnh hai luận điểm cùng lúc.', example: 'Not only does logic define our world, but so does emotion.' },
        ] 
    },

    // ID 37: Kỹ năng đàm phán
    { 
        id: 37, 
        levelTag: 'C1', 
        topic: 'Kỹ năng đàm phán', 
        vocabulary: [
            { word: 'negotiate', type: 'V', meaning: 'đàm phán' }, { word: 'compromise', type: 'N/V', meaning: 'thỏa hiệp' },
            { word: 'leverage', type: 'N/V', meaning: 'đòn bẩy' }, { word: 'consensus', type: 'N', meaning: 'đồng thuận' },
            { word: 'concession', type: 'N', meaning: 'nhượng bộ' }, { word: 'counter-offer', type: 'N', meaning: 'đề nghị phản hồi' },
            { word: 'propose', type: 'V', meaning: 'đề xuất' }, { word: 'stipulate', type: 'V', meaning: 'quy định rõ' },
            { word: 'arbitrate', type: 'V', meaning: 'phân xử' }, { word: 'dispute', type: 'N', meaning: 'tranh chấp' },
            { word: 'mutual', type: 'Adj', meaning: 'chung/lẫn nhau' }, { word: 'viable', type: 'Adj', meaning: 'khả thi' },
            { word: 'terms', type: 'N', meaning: 'điều khoản' }, { word: 'escalate', type: 'V', meaning: 'leo thang (tranh chấp)' },
            { word: 'deadline', type: 'N', meaning: 'hạn chót' }, { word: 'prerequisite', type: 'N', meaning: 'điều kiện tiên quyết' },
            { word: 'mediation', type: 'N', meaning: 'hòa giải' }, { word: 'contingency', type: 'N', meaning: 'tình huống bất ngờ' },
            { word: 'mandate', type: 'N', meaning: 'ủy quyền' }, { word: 'ratify', type: 'V', meaning: 'phê chuẩn' },
        ], 
        grammar: [
            { name: 'Giảm mệnh đề trạng ngữ (Reduction)', form: 'V-ing / V3/ed', usage: 'Rút gọn mệnh đề để lời nói và văn viết trở nên trực tiếp và mạnh mẽ hơn trong đàm phán.', example: 'Having considered the risks, we accept the terms.' },
            { name: 'Ngôn ngữ điều kiện (Providing that, As long as)', form: 'S + V + providing that/as long as + S + V', usage: 'Đặt điều kiện cho sự chấp nhận hoặc thỏa hiệp.', example: 'We will ratify the contract, providing that they meet the deadline.' },
            { name: 'Ngôn ngữ điều chỉnh (Making Concessions)', form: 'While we understand X, we must insist on Y', usage: 'Đưa ra nhượng bộ nhưng vẫn giữ vững lập trường chính.', example: 'While we appreciate your counter-offer, we must insist on the higher price.' },
            { name: 'Sử dụng If only (Regret)', form: 'If only + S + had + V3/ed', usage: 'Diễn tả sự hối tiếc về một chiến lược đàm phán trong quá khứ.', example: 'If only we had secured a better interest rate earlier.' },
            { name: 'Ngôn ngữ chuyển từ (Formal Transition)', form: 'In regard to..., With respect to..., Subsequently, Consequently', usage: 'Dùng để chuyển ý một cách trang trọng trong các cuộc đàm phán chính thức.', example: 'In regard to the payment schedule, we have prepared a new proposal.' },
        ] 
    },
    
    // ID 38: Sử dụng từ Hán Việt
    { 
        id: 38, 
        levelTag: 'C2', 
        topic: 'Sử dụng từ Hán Việt', 
        vocabulary: [
            { word: 'commence', type: 'V', meaning: 'bắt đầu (formal)' }, { word: 'peruse', type: 'V', meaning: 'nghiên cứu/đọc kỹ' },
            { word: 'ameliorate', type: 'V', meaning: 'cải thiện' }, { word: 'conjecture', type: 'N', meaning: 'phỏng đoán' },
            { word: 'vicissitudes', type: 'N', meaning: 'thăng trầm' }, { word: 'ubiquitous', type: 'Adj', meaning: 'phổ biến khắp nơi' },
            { word: 'ephemeral', type: 'Adj', meaning: 'phù du' }, { word: 'alacrity', type: 'N', meaning: 'sự sốt sắng' },
            { word: 'elucidate', type: 'V', meaning: 'làm sáng tỏ' }, { word: 'equivocate', type: 'V', meaning: 'nói lập lờ' },
            { word: 'plethora', type: 'N', meaning: 'sự quá mức/dư thừa' }, { word: 'surmise', type: 'V', meaning: 'phỏng đoán' },
            { word: 'deem', type: 'V', meaning: 'xem xét/nhận định' }, { word: 'meticulous', type: 'Adj', meaning: 'tỉ mỉ' },
            { word: 'precarious', type: 'Adj', meaning: 'bấp bênh' }, { word: 'endeavor', type: 'N/V', meaning: 'nỗ lực' },
            { word: 'subsequently', type: 'Adv', meaning: 'sau đó (formal)' }, { word: 'intricate', type: 'Adj', meaning: 'phức tạp' },
            { word: 'transient', type: 'Adj', meaning: 'nhất thời' }, { word: 'perfunctory', type: 'Adj', meaning: 'qua loa' },
        ], 
        grammar: [
            { name: 'Phrasal Verbs nâng cao (idiomatic)', form: 'V + Adv/Prep (e.g., call off, get away with)', usage: 'Sử dụng các cụm động từ phức tạp để diễn đạt tự nhiên hơn.', example: 'The manager decided to call off the meeting.' },
            { name: 'Ngôn ngữ khách quan (Nominalization)', form: 'Sử dụng danh từ thay cho động từ (e.g., the decision to ameliorate)', usage: 'Tạo văn phong học thuật, cô đọng (sử dụng với từ Hán Việt).', example: 'The amelioration of the situation requires meticulous planning.' },
            { name: 'Cấu trúc Inversion (Seldom, Rarely)', form: 'Seldom/Rarely + Aux. V + S + V', usage: 'Sử dụng để nhấn mạnh và làm cho văn phong trang trọng/văn chương.', example: 'Seldom does one encounter such profound intellectual debate.' },
            { name: 'Ngôn ngữ tường thuật gián tiếp (Complex)', form: 'He suggested that the committee commence the review immediately.', usage: 'Sử dụng các động từ tường thuật cao cấp (e.g., implore, assert, concede).', example: 'The report implicated that the findings should be scrutinized.' },
            { name: 'Giảm mệnh đề tính từ/trạng ngữ (Advanced)', form: 'The concept elucidated...', usage: 'Rút gọn câu phức để tạo tính cô đọng tuyệt đối.', example: 'The paradox inherent in human existence is often contemplated.' },
        ] 
    },
    
    // ID 39: Viết luận chuyên sâu
    { 
        id: 39, 
        levelTag: 'C2', 
        topic: 'Viết luận chuyên sâu', 
        vocabulary: [
            { word: 'thesis', type: 'N', meaning: 'luận đề/luận điểm' }, { word: 'coherent', type: 'Adj', meaning: 'chặt chẽ, mạch lạc' },
            { word: 'succinct', type: 'Adj', meaning: 'súc tích' }, { word: 'premise', type: 'N', meaning: 'tiền đề' },
            { word: 'counter-argument', type: 'N', meaning: 'phản biện' }, { word: 'rebuttal', type: 'N', meaning: 'sự bác bỏ' },
            { word: 'elucidate', type: 'V', meaning: 'làm sáng tỏ' }, { word: 'juxtaposition', type: 'N', meaning: 'sự đặt cạnh nhau' },
            { word: 'discourse', type: 'N', meaning: 'diễn ngôn' }, { word: 'articulate', type: 'V', meaning: 'phát biểu rõ ràng' },
            { word: 'metaphor', type: 'N', meaning: 'ẩn dụ' }, { word: 'analogy', type: 'N', meaning: 'phép tương tự' },
            { word: 'connotation', type: 'N', meaning: 'ý nghĩa liên tưởng' }, { word: 'denotation', type: 'N', meaning: 'nghĩa đen' },
            { word: 'verbatim', type: 'Adv', meaning: 'từng chữ một' }, { word: 'inquiry', type: 'N', meaning: 'sự tìm hiểu' },
            { word: 'substantiate', type: 'V', meaning: 'chứng minh' }, { word: 'pervasive', type: 'Adj', meaning: 'lan tỏa/phổ biến' },
            { word: 'critique', type: 'N/V', meaning: 'phê bình' }, { word: 'implicit', type: 'Adj', meaning: 'ngầm hiểu' },
        ], 
        grammar: [
            { name: 'Ngôn ngữ khách quan (Impersonal Language)', form: 'It is acknowledged that... / There is evidence to suggest...', usage: 'Dùng để viết luận, báo cáo một cách khách quan, không dùng I/We.', example: 'It is acknowledged that the data supports the initial findings.' },
            { name: 'Cấu trúc nhấn mạnh (Emphatic Structures)', form: 'What + S + V + is/was + Noun', usage: 'Nhấn mạnh một phần của câu (dùng trong giới thiệu luận điểm chính).', example: 'What is important to note is the pervasive influence of social media.' },
            { name: 'Sử dụng Modal Verbs (Deduction)', form: 'S + must/may/could + V (hiện tại/hoàn thành)', usage: 'Đưa ra suy luận có căn cứ trong văn viết.', example: 'The historical context must have influenced the author\'s perspective.' },
            { name: 'Mệnh đề danh từ rút gọn (Nominalization)', form: 'The articulation of the policy...', usage: 'Tạo sự cô đọng, chuyển động từ thành danh từ để tăng tính học thuật.', example: 'The clarification (from clarify) of the theory was necessary for the research.' },
            { name: 'Liên kết logic trang trọng (Cohesion)', form: 'In addition to, Conversely, Given that, Hence', usage: 'Nối các đoạn văn và các ý tưởng phức tạp một cách chặt chẽ.', example: 'Conversely, the counter-argument lacks empirical substantiation.' },
        ] 
    },
    
    // ID 40: Rương C2/1
    { id: 40, levelTag: 'C2', topic: 'Rương C2/1', vocabulary: [], grammar: [] },
    
    // ID 41: Ứng dụng tiếng lóng
    { 
        id: 41, 
        levelTag: 'C2', 
        topic: 'Ứng dụng tiếng lóng', 
        vocabulary: [
            { word: 'chill out', type: 'V', meaning: 'thư giãn' }, { word: 'hang out', type: 'V', meaning: 'đi chơi' },
            { word: 'lit', type: 'Adj', meaning: 'tuyệt vời/hào hứng' }, { word: 'salty', type: 'Adj', meaning: 'bực bội/ghen tị' },
            { word: 'cringe', type: 'Adj/V', meaning: 'xấu hổ/ngại' }, { word: 'GOAT', type: 'Acronym', meaning: 'Vĩ đại nhất mọi thời đại' },
            { word: 'flex', type: 'V', meaning: 'khoe khoang' }, { word: 'low-key', type: 'Adv', meaning: 'bí mật/nhẹ nhàng' },
            { word: 'high-key', type: 'Adv', meaning: 'công khai/rõ ràng' }, { word: 'shade', type: 'N', meaning: 'chế nhạo tinh tế' },
            { word: 'spill the tea', type: 'Phrase', meaning: 'tiết lộ tin đồn' }, { word: 'woke', type: 'Adj', meaning: 'tỉnh táo (về vấn đề xã hội)' },
            { word: 'FOMO', type: 'Acronym', meaning: 'sợ bỏ lỡ' }, { word: 'vibes', type: 'N', meaning: 'cảm xúc/không khí' },
            { word: 'no cap', type: 'Phrase', meaning: 'nói thật' }, { word: 'bet', type: 'Exclamation', meaning: 'đồng ý/chắc chắn rồi' },
            { word: 'stan', type: 'V/N', meaning: 'hâm mộ cuồng nhiệt' }, { word: 'simp', type: 'N', meaning: 'người quá lụy tình' },
            { word: 'main character', type: 'N', meaning: 'người nổi bật' }, { word: 'iykyk', type: 'Acronym', meaning: 'If you know, you know' },
        ], 
        grammar: [
            { name: 'Cấu trúc câu cảm thán (Sử dụng Slang)', form: 'How + Adj + it is! / What a + Noun!', usage: 'Sử dụng để bày tỏ cảm xúc mạnh mẽ theo phong cách tự nhiên, suồng sã.', example: 'How lit that party was!' },
            { name: 'Sử dụng Phrasal Verbs (Conversational)', form: 'V + Adv/Prep (e.g., run into, look out for)', usage: 'Sử dụng các cụm động từ thường ngày để nói chuyện tự nhiên.', example: 'I ran into Tom at the mall yesterday.' },
            { name: 'Ngôn ngữ rút gọn (Text/Acronyms)', form: 'IMO, IYKYK, GOAT', usage: 'Hiểu và sử dụng các từ viết tắt phổ biến trên mạng xã hội.', example: 'That movie is the GOAT, IMO.' },
            { name: 'Sử dụng Adverbs of Manner (Colloquial)', form: 'low-key, high-key', usage: 'Diễn tả mức độ rõ ràng/bí mật của hành động.', example: 'I\'m low-key tired today.' },
            { name: 'Ngôn ngữ gián tiếp (Question tags, informal)', form: 'S + V, right? / Don\'t you think?', usage: 'Hỏi ý kiến một cách suồng sã (thay vì câu hỏi đuôi trang trọng).', example: 'That food was amazing, right?' },
        ] 
    },

    // ID 42: Phân tích ngữ nghĩa
    { 
        id: 42, 
        levelTag: 'C2', 
        topic: 'Phân tích ngữ nghĩa', 
        vocabulary: [
            { word: 'semantics', type: 'N', meaning: 'ngữ nghĩa học' }, { word: 'pragmatics', type: 'N', meaning: 'ngữ dụng học' },
            { word: 'etymology', type: 'N', meaning: 'từ nguyên học' }, { word: 'lexicon', type: 'N', meaning: 'từ vựng cốt lõi' },
            { word: 'homophone', type: 'N', meaning: 'từ đồng âm' }, { word: 'polysemy', type: 'N', meaning: 'tính đa nghĩa' },
            { word: 'connotation', type: 'N', meaning: 'ý nghĩa liên tưởng' }, { word: 'denotation', type: 'N', meaning: 'nghĩa đen' },
            { word: 'euphemism', type: 'N', meaning: 'uyển ngữ' }, { word: 'dysphemism', type: 'N', meaning: 'thô ngữ' },
            { word: 'derive', type: 'V', meaning: 'bắt nguồn' }, { word: 'suffix', type: 'N', meaning: 'hậu tố' },
            { word: 'prefix', type: 'N', meaning: 'tiền tố' }, { word: 'root word', type: 'N', meaning: 'từ gốc' },
            { word: 'inflection', type: 'N', meaning: 'biến tố' }, { word: 'morphology', type: 'N', meaning: 'hình thái học' },
            { word: 'syntax', type: 'N', meaning: 'cú pháp' }, { word: 'idiomatic', type: 'Adj', meaning: 'thành ngữ' },
            { word: 'collocation', type: 'N', meaning: 'kết hợp từ' }, { word: 'jargon', type: 'N', meaning: 'thuật ngữ chuyên ngành' },
        ], 
        grammar: [
            { name: 'Tạo từ mới (Word Formation)', form: 'Prefix + Root + Suffix (e.g., mis + understand + ing)', usage: 'Phân tích và xây dựng các từ phức tạp (sử dụng trong bài luận).', example: 'The analysis required a careful *reassessment* of the methodology.' },
            { name: 'Sử dụng Collocations Nâng cao', form: 'Adj + N / V + N (e.g., profound impact, fiercely independent)', usage: 'Sử dụng các cụm từ cố định để tăng tính tự nhiên và trang trọng.', example: 'The findings had a profound impact on the theoretical framework.' },
            { name: 'Phân biệt Connotation vs Denotation', form: 'Positive/Negative/Neutral Association', usage: 'Phân tích ý nghĩa liên tưởng (tích cực/tiêu cực) của các từ.', example: 'The word "thrifty" has a positive connotation, while "stingy" is negative.' },
            { name: 'Phân tích Euphemism và Dysphemism', form: 'Softening or intensifying language', usage: 'Hiểu cách ngôn ngữ được sử dụng để giảm nhẹ hoặc làm nổi bật ý nghĩa.', example: 'The phrase "passed away" is a euphemism for "died".' },
            { name: 'Ngôn ngữ So sánh và Đối chiếu (Academic)', form: 'In contrast to X, Y suggests...', usage: 'Sử dụng ngôn ngữ so sánh phức tạp trong các bài luận phê bình.', example: 'In stark contrast to the initial hypothesis, the data suggested otherwise.' },
        ] 
    },

    // ID 43: Đánh giá phê bình
    { 
        id: 43, 
        levelTag: 'C2', 
        topic: 'Đánh giá phê bình', 
        vocabulary: [
            { word: 'critique', type: 'N/V', meaning: 'phê bình' }, { word: 'bias', type: 'N', meaning: 'thiên vị' },
            { word: 'evaluate', type: 'V', meaning: 'đánh giá' }, { word: 'rationale', type: 'N', meaning: 'cơ sở lý luận' },
            { word: 'validity', type: 'N', meaning: 'tính hợp lệ' }, { word: 'reliability', type: 'N', meaning: 'độ tin cậy' },
            { word: 'refute', type: 'V', meaning: 'bác bỏ' }, { word: 'substantiate', type: 'V', meaning: 'chứng minh' },
            { word: 'premise', type: 'N', meaning: 'tiền đề' }, { word: 'flaw', type: 'N', meaning: 'sai sót' },
            { word: 'discern', type: 'V', meaning: 'nhận thấy/phân biệt' }, { word: 'discrepancy', type: 'N', meaning: 'sự khác biệt' },
            { word: 'synthesize', type: 'V', meaning: 'tổng hợp' }, { word: 'paradoxical', type: 'Adj', meaning: 'nghịch lý' },
            { word: 'meticulous', type: 'Adj', meaning: 'tỉ mỉ' }, { word: 'impartial', type: 'Adj', meaning: 'công bằng' },
            { word: 'scrutinize', type: 'V', meaning: 'xem xét kỹ' }, { word: 'cohesion', type: 'N', meaning: 'sự gắn kết' },
            { word: 'lucid', type: 'Adj', meaning: 'rõ ràng, sáng sủa' }, { word: 'concise', type: 'Adj', meaning: 'ngắn gọn, súc tích' },
        ], 
        grammar: [
            { name: 'Tóm tắt & Tổng hợp (Academic)', form: 'In essence, the author posits that... / To synthesize the argument...', usage: 'Sử dụng ngôn ngữ formal để tổng hợp các luận điểm của nhiều nguồn.', example: 'To synthesize the primary findings, we can conclude that the results lack validity.' },
            { name: 'Giả định với Should/Must (Formal Critique)', form: 'It is mandatory that X be done... / The critique must address...', usage: 'Đưa ra các yêu cầu hoặc phê bình nghiêm khắc.', example: 'The paper must include a detailed rationale for the chosen methodology.' },
            { name: 'Sử dụng Đảo ngữ (No sooner... than)', form: 'No sooner + had S + V3/ed + than + S + V2/ed', usage: 'Nhấn mạnh sự liên tục của hai sự kiện (thường dùng để mô tả một chuỗi hành động trong văn học).', example: 'No sooner had she published the paper than it was scrutinized by her peers.' },
            { name: 'Ngôn ngữ Phân tích và Phê bình', form: 'The premise suffers from a flaw... / The author fails to account for...', usage: 'Sử dụng động từ và danh từ mạnh để đưa ra đánh giá tiêu cực hoặc tích cực.', example: 'The initial premise suffers from a fundamental flaw in logic.' },
            { name: 'Cấu trúc Emphatic (Exclusion)', form: 'Not until X did Y happen', usage: 'Nhấn mạnh mốc thời gian hoặc điều kiện mà tại đó sự việc xảy ra.', example: 'Not until the bias was identified did the researchers refute the results.' },
        ] 
    },
    
    // ID 44: Đạt cấp độ C2
    { 
        id: 44, 
        levelTag: 'C2', 
        topic: 'Đạt cấp độ C2', 
        vocabulary: [
            { word: 'proficiency', type: 'N', meaning: 'sự thành thạo' }, { word: 'articulate', type: 'V', meaning: 'ăn nói lưu loát' },
            { word: 'nuance', type: 'N', meaning: 'sắc thái tinh tế' }, { word: 'fluent', type: 'Adj', meaning: 'trôi chảy' },
            { word: 'idiomatic', type: 'Adj', meaning: 'mang tính thành ngữ' }, { word: 'spontaneous', type: 'Adj', meaning: 'tự phát' },
            { word: 'lexical resource', type: 'N', meaning: 'nguồn từ vựng' }, { word: 'cohesion', type: 'N', meaning: 'sự gắn kết' },
            { word: 'accuracy', type: 'N', meaning: 'độ chính xác' }, { word: 'sophistication', type: 'N', meaning: 'sự tinh tế' },
            { word: 'versatility', type: 'N', meaning: 'tính linh hoạt' }, { word: 'grasp', type: 'V', meaning: 'nắm bắt' },
            { word: 'comprehend', type: 'V', meaning: 'thấu hiểu' }, { word: 'discourse marker', type: 'N', meaning: 'từ nối câu' },
            { word: 'colloquial', type: 'Adj', meaning: 'thông tục' }, { word: 'register', type: 'N', meaning: 'ngữ vực/phong cách' },
            { word: 'paraphrase', type: 'V', meaning: 'diễn giải' }, { word: 'synthesize', type: 'V', meaning: 'tổng hợp' },
            { word: 'tenuous', type: 'Adj', meaning: 'mong manh, mỏng manh' }, { word: 'unfettered', type: 'Adj', meaning: 'không bị ràng buộc' },
        ], 
        grammar: [
            { name: 'Sử dụng các Adverbial Clause phức tạp', form: 'Not only/But also/Hardly... when/etc.', usage: 'Sử dụng các mệnh đề trạng ngữ nâng cao để tăng cường sự phức tạp của câu.', example: 'Hardly had she finished the course when she received the job offer.' },
            { name: 'Thì và Modal hoàn hảo (Perfect Tenses & Modals)', form: 'Would have V3/ed, Should have V3/ed', usage: 'Sử dụng các cấu trúc hoàn hảo để thể hiện sự hối tiếc, khả năng, giả định trong quá khứ.', example: 'You would have passed the exam if you had trusted your instincts.' },
            { name: 'Thành thạo Giảm mệnh đề (Reduction)', form: 'Having V3/ed, Being V-ing, To V...', usage: 'Sử dụng để rút gọn câu phức, tạo văn phong cực kỳ cô đọng và trang trọng.', example: 'Having attained C2 proficiency, she felt ready for any challenge.' },
            { name: 'Ngôn ngữ Miêu tả Cảm xúc và Phong cách', form: 'S + V + with + Adj + Noun (e.g., with remarkable fluency)', usage: 'Miêu tả hành động với sự tinh tế, thường dùng trong phê bình văn học/âm nhạc.', example: 'She spoke with remarkable fluency, grasping every subtle nuance.' },
            { name: 'Sử dụng các Ngữ vực (Register)', form: 'Formal vs Informal vocabulary/syntax', usage: 'Sử dụng chính xác ngôn ngữ phù hợp với bối cảnh (hàn lâm, chuyên nghiệp, thông tục).', example: 'Formal: I appreciate your prompt consideration. Informal: Thanks for getting back to me so fast.' },
        ] 
    },

    // ID 45: THỬ THÁCH C1-C2
    { id: 45, levelTag: 'C2', topic: 'THỬ THÁCH C1-C2', vocabulary: [], grammar: [] },
];