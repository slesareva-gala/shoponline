--
-- PostgreSQL database dump
--

\restrict cOmS8KISFhKUEoanSI33q8L7vzkQgnQ0QV7WSqUZfO6KozkyXSU4aLLhX4grMko

-- Dumped from database version 14.22
-- Dumped by pg_dump version 14.22

-- Started on 2026-06-06 20:25:39

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 211 (class 1259 OID 16424)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(25) NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 16427)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO postgres;

--
-- TOC entry 3344 (class 0 OID 0)
-- Dependencies: 212
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 214 (class 1259 OID 16938)
-- Name: countkey; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.countkey (
    tables character varying(25) DEFAULT ''::character varying NOT NULL,
    keycurrent bigint DEFAULT 0 NOT NULL,
    keyfirst bigint DEFAULT 1 NOT NULL,
    keybottom bigint DEFAULT 10000 NOT NULL
);


ALTER TABLE public.countkey OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 16434)
-- Name: goods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.goods (
    id character varying(10) NOT NULL,
    title character varying(255) NOT NULL,
    price integer NOT NULL,
    description text NOT NULL,
    discount smallint NOT NULL,
    count integer NOT NULL,
    image character varying(20) NOT NULL,
    categories_id integer NOT NULL,
    units_id smallint NOT NULL,
    inwork boolean DEFAULT true NOT NULL
);


ALTER TABLE public.goods OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 16403)
-- Name: units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.units (
    id smallint NOT NULL,
    name character varying(6) NOT NULL
);


ALTER TABLE public.units OWNER TO postgres;

--
-- TOC entry 210 (class 1259 OID 16416)
-- Name: units_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.units_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.units_id_seq OWNER TO postgres;

--
-- TOC entry 3345 (class 0 OID 0)
-- Dependencies: 210
-- Name: units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.units_id_seq OWNED BY public.units.id;


--
-- TOC entry 3178 (class 2604 OID 16792)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 3177 (class 2604 OID 16793)
-- Name: units id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units ALTER COLUMN id SET DEFAULT nextval('public.units_id_seq'::regclass);


--
-- TOC entry 3335 (class 0 OID 16424)
-- Dependencies: 211
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name) FROM stdin;
2	Мобильный телефон
3	Игрушки
4	ТВ приставка
5	Кабеля
6	Уход за домом
7	Умный дом
8	Портативный транспорт
9	VR системы
10	Детский транспорт
11	Кухонная техника
12	Красота и здоровье
13	Инструмент
1	 без категории
\.


--
-- TOC entry 3338 (class 0 OID 16938)
-- Dependencies: 214
-- Data for Name: countkey; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.countkey (tables, keycurrent, keyfirst, keybottom) FROM stdin;
goods	0	1	500
\.


--
-- TOC entry 3337 (class 0 OID 16434)
-- Dependencies: 213
-- Data for Name: goods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.goods (id, title, price, description, discount, count, image, categories_id, units_id, inwork) FROM stdin;
2424579063	Автоматическая кофемашина Nivona NICR 520	33990	Кофемашина Нивона 520 подарит ценителям кофе истинный аромат и вкус великолепного тонизирующего напитка.\nАппарат позволяет в автоматическом режиме сварить черный кофе. Также машина имеет капучинатор с ручным управлением.	0	6	image/2424579063.jpg	11	1	f
1544896182	Моноколесо Ninebot One-Z10	140000	Моноколесо Ninebot One-Z10 обладает мощными характеристиками и продолжительной автономной работой. Благодаря мотору мощностью 1800 Вт транспортное средство способно развивать скорость в пределах 45 км/ч. Колесо с широкой покрышкой отличается высокими показателями сцепления и устойчивостью на различных поверхностях. Брызговик предусматривает возможность езды в любую погоду, а светодиодная фара и подсветка с боковой стороны позволяют перемещаться в темное время суток. Педали с нескользящим покрытием гарантируют комфортное размещение на моноколесе Ninebot One-Z10. Аккумулятор, обладающий энергоемкостью 1000 Вт*ч, гарантирует около 80-100 км на одном цикле зарядки.	10	7	image/1544896182.jpg	8	1	f
1732512010	Швабра Gelberk GL-SM02	1800	Швабра Gelberk GL-SM02 с системой распыления воды простым нажатием обеспечивает максимальную эффективность мытья гладких напольных поверхностей и предоставляет возможность сухой уборки. Насадка в виде плоского мопа с ворсом из качественной микрофибры помогает тщательно очищать поверхности от пыли и загрязнений без оставления разводов. Поворот насадки на 360 градусов повышает комфорт в эксплуатации. Рукоятка изготовлена из металла и обладает длиной 125 см. Пластиковая ручка эргономичной формы позволяет с удобством удерживать швабру Gelberk GL-SM02.	10	12	image/1732512010.jpg	6	1	f
3134249301	Нёрф Ультра Дорадо	3999	Кто окажется на высоте в очередном Нёрф-cражении? Моторизованный бластер Нёрф Ультра Дорадо с золотистыми вставками поставляется с 12 особыми стрелами Нёрф Ультра. Барабан вмещает 6 стрел и благодаря тому, что он открыт сзади, игроки видят, сколько стрел осталось, и когда нужно зарядить оружие. Усовершенствованный дизайн и увеличенная мощность обеспечивают более высокие показатели дальности и скорости полета стрелы, а также точности выстрела.	0	14	image/3134249301.jpg	3	1	f
6300524222	Радиоуправляемый автомобиль Cheetan	6000	Внедорожник на дистанционном управлении. Скорость 25км/ч. Возраст 7 - 14 лет	5	1	image/6300524222.jpg	3	1	f
3725842217	Электробритва Braun Series 5 50-M1000s	6200	Электробритва Series 5 50-M1000s для влажного и сухого бритья. Электробритва с 3 плавающими лезвиями, которые адаптируются к контурам лица для легкого бритья. Система EasyClean обеспечивает быструю и простую очистку без снятия бритвенной головки. 100% водонепроницаемая электробритва для влажного и сухого использования	5	9	image/3725842217.jpg	12	1	f
3899535506	Электрический чайник Tefal Glass Kettle	4890	Электрочайник Tefal KI772D32 имеет внутреннюю подсветку, что создает комфортные условия при использовании в ночное время. Модель характеризуется оптимальной мощностью, поэтому вода закипает в течение нескольких минут.	0	11	image/3899535506.jpg	11	1	f
5784241001	Топор 800 г с фиберглассовой рукоятью VIRA RAGE	1803	Общий вес 1125 г, вес топорища - 800 г. Длина Топора - 41см. Топор служит для раскалывания, расщепления дров, первичной обработки древесины. Мы держим под контролем качество продукции и используем для ударной поверхности инструментальную сталь CS45. Рабочая часть топора плотно соединена с рукояткой и ощущается как её продолжение. Эти части практически невозможно разделить. Твердость бойка топора: 55-60 HRC. Топор заточен под углом 40 градусов – это позволяет достаточно глубоко углублять лезвие в древесину, при этом дольше поддерживать его острым. Рукоятка топора из фибергласса очень прочна, но легка. При использовании многократной намотки из этого сырья изготавливают парусные мачты, автомобильные глушители и велосипедные рамы. Ещё одно преимущество материала – его способность гасить передающиеся удары, а значит вы меньше отобьете руки разрубая древесину. Покрытие из термопластичной резины TPR мягкое на ощупь и не дает рукоятке скользить в ладони. Мы привели топоры компании VIRA RAGE в соответствие с требованиями немецкого промышленного стандарта качества Geprüfte Sicherheit (GS). Кроме того, топоры соответствуют качеству британского института стандартов BSI.	20	3	image/5784241001.jpg	13	1	f
6742072908	ТВ приставка MECOOL KI	14400	Всего лишь один шаг сделает ваш телевизор умным, Быстрый и умный MECOOL KI PRO, прекрасно спроектированный, сочетает в себе прочный процессор Cortex-A53 с чипом Amlogic S905D	15	4	image/6742072908.jpg	4	1	f
8732500050	Витая пара PROConnect 01-0043-3-25	32	Витая пара Proconnect 01-0043-3-25 является сетевым кабелем с 4 парами проводов типа UTP, в качестве проводника в которых используется алюминий, плакированный медью CCA. Такая неэкранированная витая пара с одножильными проводами диаметром 0.50 мм широко применяется в процессе сетевых монтажных работ. С ее помощью вы сможете обеспечить развертывание локальной сети в домашних условиях или на предприятии, объединить все необходимое вам оборудование в единую сеть.	0	420	image/8732500050.jpg	5	2	f
8834849904	Игрушечный трек Mattel Hot Wheels	22110	Готовы к захватывающим приключениям в Hot Wheels Сити? Тогда вперед! Встречайте игровой набор невообразимый гараж с тиранозавром! Этот высочайший набор вмещает более 100 машинок и таит в себе непредсказуемого Т-Рекса, который делает заезд в гараж максимально захватывающим!	40	4	image/8834849904.jpg	3	1	f
8847764238	Система виртуальной реальности HTC Vive PRO	128299	Система виртуальной реальности HTC Vive PRO представляет собой комплект, в который включен шлем, контроллеры и базовые SteamVR 2.0. В шлеме предусмотрено 2 экрана, разрешением каждого из которых составляет 1440×1600 пикселей, что позволит вам насладиться невероятно реалистичной картинкой. Модель HTC Vive PRO хороша и тем, что в ней появилось 2 микрофона с функцией шумоподавления, обеспечивающих насыщенное и четкое звучание. Система с легкостью подключается к ПК или ноутбуку при помощи USB-интерфейса. Благодаря хорошо продуманной форме шлем подходит к любой форме лица.	0	10	image/8847764238.jpg	9	1	f
0640676534	Смартфон Apple iPhone 15 Pro 256 ГБ	179999	iPhone 15 Pro: новый король смартфонов с инновационными функциями!\\nВстречайте мощный и стильный iPhone с передовыми технологиями!\\nПредставляем iPhone 15 Pro, новый флагман Apple, который изменит ваше представление о смартфонах. Он оснащен OLED-дисплеем с диагональю 6.1 дюйма и технологией Super Retina XDR для непревзойденной цветопередачи и яркости.\\nВ основе iPhone 15 Pro лежит мощнейший процессор A17 Pro, который гарантирует молниеносное быстродействие и плавную работу при любых нагрузках. Тройная камера с оптической стабилизацией обеспечивает потрясающие снимки и кинематографические видео. Технология Face ID гарантирует быструю и безопасную аутентификацию.\\nАккумулятор увеличенной емкости поддерживает быструю зарядку, позволяя работать и играть весь день без перерыва. Поддержка 5G гарантирует быстрое и стабильное подключение в любой точке мира. Стильный дизайн с прочным корпусом и защитой от воды и пыли сделает iPhone 15 Pro вашим идеальным компаньоном.\\nЕсли вы хотите быть впереди всех в мире технологий, iPhone 15 Pro создан именно для вас!	6	15	image/0640676534.jpg	2	1	f
2074454224	Смартфон Xiaomi 11T 8/128GB	32000	Смартфон Xiaomi 11T – это представитель флагманской линейки, выпущенной во второй половине 2021 года. И он полностью соответствует такому позиционированию, предоставляя своим обладателям возможность пользоваться отличными камерами, ни в чем себя не ограничивать при запуске игр и других требовательных приложений.	0	5	image/2074454224.jpg	2	1	f
2714576057	Замок Aqara Door lock N100 ZNMS16LM	22000	Замок электромеханический с отпечатком пальца Aqara AQARA Door lock N100 ZNMS16LM – это особенное устройство, которое предусматривает наличие в комплекте внешней, внутренней частей замка, корпуса, цилиндра замка, дверной коробки. То есть замок содержит все, что необходимо для его установки, включая набор монтажных болтов. Для его работы потребуются батарейки АА в количестве 8 штук: они также включены в комплект. Aqara AQARA Door lock N100 ZNMS16LM представляет собой электромеханический замок с сенсорной системой. Он использует несколько способов открывания: с помощью кода доступа, механического ключа, отпечатка пальца, а также через мобильное приложение. Ручки внутренней и внешней накладок ориентированы по умолчанию на правую сторону, но при необходимости ориентацию открывания легко сменить. На внешней стороне замка находится сканер отпечатков. Верхняя его часть содержит кнопку звонка, а также зону чтения карточек NFC и клавиатуру, предназначенную для ввода пароля. В нижней части устройства находится скважина под обычный ключ.	0	4	image/2714576057.png	7	1	f
9574693288	Коляска-трансформер Happy Baby MOMMER	38000	Коляска-трансформер Happy Baby Mommer - универсальный вариант для детей с рождения и до 3 лет.	10	3	image/9574693288.jpg	10	1	f
\.


--
-- TOC entry 3333 (class 0 OID 16403)
-- Dependencies: 209
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.units (id, name) FROM stdin;
1	шт
2	м
5	кв.м
\.


--
-- TOC entry 3346 (class 0 OID 0)
-- Dependencies: 212
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 23, true);


--
-- TOC entry 3347 (class 0 OID 0)
-- Dependencies: 210
-- Name: units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.units_id_seq', 6, true);


--
-- TOC entry 3187 (class 2606 OID 16791)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3191 (class 2606 OID 16958)
-- Name: countkey countkey_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countkey
    ADD CONSTRAINT countkey_pkey PRIMARY KEY (tables);


--
-- TOC entry 3189 (class 2606 OID 16445)
-- Name: goods goods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods
    ADD CONSTRAINT goods_pkey PRIMARY KEY (id);


--
-- TOC entry 3185 (class 2606 OID 16422)
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- TOC entry 3193 (class 2606 OID 16794)
-- Name: goods categories_pkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods
    ADD CONSTRAINT categories_pkey FOREIGN KEY (categories_id) REFERENCES public.categories(id) NOT VALID;


--
-- TOC entry 3192 (class 2606 OID 16451)
-- Name: goods units_pkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods
    ADD CONSTRAINT units_pkey FOREIGN KEY (units_id) REFERENCES public.units(id) NOT VALID;


-- Completed on 2026-06-06 20:25:39

--
-- PostgreSQL database dump complete
--

\unrestrict cOmS8KISFhKUEoanSI33q8L7vzkQgnQ0QV7WSqUZfO6KozkyXSU4aLLhX4grMko

