/**
 * The $1 Unistroke Recognizer (JavaScript version)
 *
 *	Jacob O. Wobbrock, Ph.D.
 * 	The Information School
 *	University of Washington
 *	Seattle, WA 98195-2840
 *	wobbrock@uw.edu
 *
 *	Andrew D. Wilson, Ph.D.
 *	Microsoft Research
 *	One Microsoft Way
 *	Redmond, WA 98052
 *	awilson@microsoft.com
 *
 *	Yang Li, Ph.D.
 *	Department of Computer Science and Engineering
 * 	University of Washington
 *	Seattle, WA 98195-2840
 * 	yangli@cs.washington.edu
 *
 * The academic publication for the $1 recognizer, and what should be 
 * used to cite it, is:
 *
 *	Wobbrock, J.O., Wilson, A.D. and Li, Y. (2007). Gestures without 
 *	  libraries, toolkits or training: A $1 recognizer for user interface 
 *	  prototypes. Proceedings of the ACM Symposium on User Interface 
 *	  Software and Technology (UIST '07). Newport, Rhode Island (October 
 *	  7-10, 2007). New York: ACM Press, pp. 159-168.
 *
 * The Protractor enhancement was separately published by Yang Li and programmed 
 * here by Jacob O. Wobbrock:
 *
 *	Li, Y. (2010). Protractor: A fast and accurate gesture
 *	  recognizer. Proceedings of the ACM Conference on Human
 *	  Factors in Computing Systems (CHI '10). Atlanta, Georgia
 *	  (April 10-15, 2010). New York: ACM Press, pp. 2169-2172.
 *
 * This software is distributed under the "New BSD License" agreement:
 *
 * Copyright (C) 2007-2012, Jacob O. Wobbrock, Andrew D. Wilson and Yang Li.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the names of the University of Washington nor Microsoft,
 *      nor the names of its contributors may be used to endorse or promote
 *      products derived from this software without specific prior written
 *      permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Jacob O. Wobbrock OR Andrew D. Wilson
 * OR Yang Li BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/
//
// Point class
//
function Point(x, y) // constructor
{
	this.X = x;
	this.Y = y;
}
//
// Rectangle class
//
function Rectangle(x, y, width, height) // constructor
{
	this.X = x;
	this.Y = y;
	this.Width = width;
	this.Height = height;
}
//
// Unistroke class: a unistroke template
//
function Unistroke(name, points) // constructor
{
	this.Name = name;
	this.Points = Resample(points, NumPoints);
	var radians = IndicativeAngle(this.Points);
	this.Points = RotateBy(this.Points, -radians);
	this.Points = ScaleTo(this.Points, SquareSize);
	this.Points = TranslateTo(this.Points, Origin);
	this.Vector = Vectorize(this.Points); // for Protractor
}
//
// Result class
//
function Result(name, score) // constructor
{
	this.Name = name;
	this.Score = score;
}
//
// DollarRecognizer class constants
//
var NumUnistrokes = 4;
var NumPoints = 64;
var SquareSize = 250.0;
var Origin = new Point(0,0);
var Diagonal = Math.sqrt(SquareSize * SquareSize + SquareSize * SquareSize);
var HalfDiagonal = 0.5 * Diagonal;
var AngleRange = Deg2Rad(45.0);
var AnglePrecision = Deg2Rad(2.0);
var Phi = 0.5 * (-1.0 + Math.sqrt(5.0)); // Golden Ratio
//
// DollarRecognizer class
//
function DollarRecognizer() // constructor
{
	//
	// one built-in unistroke per gesture type
	//
	this.Unistrokes = new Array(4);
    //this.Unistrokes[0] = new Unistroke("left",new Array(new Point(352,343),new Point(361,343),new Point(371,343),new Point(372,343),new Point(380,343),new Point(390,343),new Point(392,344),new Point(399,344),new Point(409,344),new Point(419,345),new Point(428,346),new Point(428,346),new Point(438,346),new Point(447,346),new Point(457,346),new Point(460,347),new Point(466,347),new Point(476,347),new Point(476,346),new Point(486,346),new Point(492,346),new Point(495,346.67574516507165),new Point(505.0260566966042,348.4423856306133),new Point(508,349),new Point(514.4879231783381,348.0268115232493),new Point(523.9681384198698,346.60477923701956),new Point(528,346),new Point(533.5024329387587,346.2751216469379),new Point(543.0767469156726,346.7538373457836),new Point(548,347),new Point(543.6557106367445,345.32262160696524),new Point(534.7128927870208,341.8697002705441),new Point(525.7700749372971,338.416778934123),new Point(516.8272570875733,334.96385759770186),new Point(507,331),new Point(498.9416213881258,328.0580149248596),new Point(489.998803538402,324.6050935884385),new Point(481.0559856886782,321.15217225201735),new Point(472.11316783895444,317.6992509155962),new Point(463.17034998923066,314.2463295791751),new Point(454.2275321395069,310.79340824275397),new Point(445.2847142897831,307.34048690633284),new Point(436.3418964400593,303.8875655699117),new Point(427.39907859033553,300.4346442334906),new Point(418.45626074061175,296.98172289706946),new Point(409.513442890888,293.52880156064833),new Point(400.5706250411642,290.0758802242272),new Point(391.6278071914404,286.6229588878061),new Point(382.68498934171663,283.17003755138495),new Point(373.74217149199285,279.7171162149638),new Point(364.79935364226907,276.2641948785427),new Point(355.8565357925453,272.81127354212157),new Point(346.9137179428215,269.35835220570044),new Point(337.9709000930977,265.9054308692793),new Point(329.02808224337394,262.4525095328582),new Point(320.08526439365016,258.99958819643706),new Point(311.1424465439264,255.54666686001593),new Point(302.1996286942026,252.0937455235948),new Point(293.2568108444788,248.64082418717368),new Point(284.31399299475504,245.18790285075255),new Point(275.37117514503126,241.73498151433142),new Point(266.4283572953075,238.2820601779103),new Point(257.4855394455837,234.8291388414892),new Point(248.54272159585992,231.37621750506807),new Point(239.59990374613614,227.92329616864697),new Point(230.65708589641235,224.47037483222584),new Point(221.71426804668857,221.01745349580472),new Point(212.7714501969648,217.56453215938362),new Point(203.828632347241,214.1116108229625),new Point(194.88581449751723,210.65868948654136),new Point(188,208),new Point(188.41258398086205,210.16606589952576),new Point(190.20629199043108,219.58303294976324),new Point(192,229)));
    this.Unistrokes[0] = new Unistroke("right", new Array(new Point(883,95),new Point(883,98),new Point(883,101),new Point(883,108),new Point(883,115),new Point(883,125),new Point(883,144),new Point(883,156),new Point(883,167),new Point(885,186),new Point(885,199),new Point(886,208),new Point(888,218),new Point(888,224),new Point(888,229),new Point(889,239),new Point(889,247),new Point(889,257),new Point(889,261),new Point(889,264),new Point(889,265),new Point(889,266),new Point(889,267),new Point(889,268),new Point(889,270),new Point(889,271),new Point(889,272),new Point(889,273),new Point(890,274),new Point(892,274),new Point(893,274),new Point(897,274),new Point(901,274),new Point(910,274),new Point(919,274),new Point(926,274),new Point(936,274),new Point(941,274),new Point(944,274),new Point(947,273),new Point(948,273),new Point(951,272),new Point(955,272),new Point(958,271),new Point(961,271)));

    //this.Unistrokes[1] = new Unistroke("right",new Array(new Point(468,404),new Point(468,400),new Point(468,397),new Point(467,397),new Point(464,398),new Point(461,400),new Point(457,402),new Point(454,404),new Point(451,406),new Point(447,407),new Point(444,409),new Point(441,411),new Point(438,413),new Point(434,414),new Point(431,416.),new Point(428,418),new Point(424,420),new Point(421,421),new Point(418,423),new Point(416,425),new Point(415,424),new Point(413.2901786319424,421.16108639525174),new Point(411.1425415135917,418.11860047758825),new Point(408.994904395241,415.07611455992475),new Point(406.8472672768903,412.03362864226125),new Point(404.6996301585396,408.99114272459775),new Point(404,408),new Point(402.5231463039953,410.03067383200647),new Point(400.33272463894554,413.0425036214499),new Point(398.14230297389577,416.0543334108933),new Point(395.951881308846,419.06616320033675),new Point(393.76145964379623,422.07799298978017),new Point(391,425),new Point(389.3806163136967,428.101652568667),new Point(388,430),new Point(387.38426829399435,428.76853658798865),new Point(385.7187914402796,425.4375828805591),new Point(384.0533145865648,422.10662917312953),new Point(382.38783773285,418.7756754657),new Point(380.72236087913524,415.4447217582704),new Point(379.05688402542046,412.11376805084086),new Point(377.3914071717057,408.7828143434113),new Point(376,406),new Point(375.3954998869429,405.89924998115714),new Point(371.7220510801132,405.2870085133522),new Point(368.0486022732835,404.67476704554724),new Point(364.3751534664538,404.0625255777423),new Point(364,404),new Point(360.7899604303527,403.06373845885287),new Point(357.21480574888835,402.02098501009243),new Point(353.639651067424,400.978231561332),new Point(350.0644963859596,399.93547811257156),new Point(346.48934170449525,398.8927246638111),new Point(342.9141870230309,397.8499712150507),new Point(340,397),new Point(339.35014599197905,396.77255109719266),new Point(335.8351047196861,395.54228665189015),new Point(332.3200634473932,394.31202220658764),new Point(328.80502217510025,393.08175776128513),new Point(325.2899809028073,391.85149331598257),new Point(321.7749396305144,390.62122887068006),new Point(320,390),new Point(318.3510298838666,389.17551494193333),new Point(315.02007617643704,387.51003808821855),new Point(311.6891224690075,385.8445612345038),new Point(308.35816876157793,384.179084380789),new Point(305.02721505414837,382.5136075270742),new Point(301.6962613467188,380.84813067335944),new Point(300,380),new Point(298.31294619653136,379.2970609152214),new Point(294.8752974643541,377.8647072768142),new Point(291.43764873217685,376.432353638407),new Point(288,375)));
    this.Unistrokes[1] = new Unistroke("left", new Array(new Point(933,164),new Point(934,165),new Point(937,167),new Point(941,170),new Point(948,178),new Point(961,190),new Point(981,208),new Point(1002,227),new Point(1015,238),new Point(1022,247),new Point(1029,256),new Point(1035,265),new Point(1039,274),new Point(1042,281),new Point(1044,286),new Point(1045,288),new Point(1045,290),new Point(1045,291),new Point(1045,292),new Point(1040,294),new Point(1017,309),new Point(998,319),new Point(979,331),new Point(967,335),new Point(963,338),new Point(960,338),new Point(959,339),new Point(958,339),new Point(957,339),new Point(956,340),new Point(953,342),new Point(949,344),new Point(946,346),new Point(942,348),new Point(940,349),new Point(939,349),new Point(938,350),new Point(938,351)));

    //this.Unistrokes[2] = new Unistroke("up",new Array(new Point(32,27),new Point(17,33),new Point(2,40),new Point(0,41),new Point(6,53),new Point(13,68),new Point(20,83),new Point(27,98),new Point(34,112),new Point(41,127),new Point(48,142),new Point(55,157),new Point(62,172),new Point(69,186),new Point(76,201),new Point(83,216),new Point(90,231),new Point(97,245),new Point(104,260),new Point(111,275),new Point(118,290),new Point(125,305.1280570082193),new Point(132,319.91268160204515),new Point(139.16235996057802,334.697306195871),new Point(146.16774682046244,349.4819307896969),new Point(153.17313368034687,364.26655538352276),new Point(160.1785205402313,379.0511799773486),new Point(167.18390740011574,393.8358045711745),new Point(172,404),new Point(172,405),new Point(176.04241932120385,404.2420463772743),new Point(188,402),new Point(184.24843396898638,403.8757830155068),new Point(169.6153052690261,411.19234736548697),new Point(168,412),new Point(175.6055610454152,399.59092671537525),new Point(184.15485150118366,385.64208439280566),new Point(192.70414195695213,371.69324207023607),new Point(201.25343241272057,357.7443997476665),new Point(209.802722868489,343.7955574250969),new Point(218.35201332425748,329.8467151025273),new Point(226.90130378002593,315.8978727799577),new Point(235.4505942357944,301.9490304573881),new Point(243.99988469156284,288.00018813481853),new Point(244,288),new Point(234.29519576370993,301.1708057492508),new Point(224.59026063224104,314.34178914195854),new Point(214.88532550077215,327.5127725346663),new Point(205.1803903693033,340.683755927374),new Point(195.4754552378344,353.85473932008176),new Point(185.77052010636555,367.0257227127895),new Point(176.0655849748967,380.19670610549724),new Point(166.36064984342784,393.367689498205),new Point(156.65571471195898,406.5386728909127),new Point(146.95077958049012,419.7096562836205),new Point(137.24584444902126,432.88063967632826),new Point(132,440),new Point(136.55564065515577,434.02072164010804),new Point(146.47071083181808,421.00719203323877),new Point(156.3857810084804,407.9936624263695),new Point(166.3008511851427,394.9801328195002),new Point(176.21592136180502,381.9666032126309),new Point(186.13099153846733,368.95307360576163),new Point(196.04606171512964,355.9395439988923),new Point(205.96113189179198,342.92601439202303),new Point(215.8762020684543,329.91248478515377),new Point(225.7912722451166,316.89895517828444),new Point(235.7063424217789,303.88542557141517),new Point(244,293),new Point(243.47530940985334,290.3765470492666),new Point(240.26678369139032,274.33391845695155),new Point(240,273),new Point(240,287.99999999999966),new Point(240,288)));
    //this.Unistrokes[2] = new Unistroke("up", new Array(new Point(870,266),new Point(870,265),new Point(872,261),new Point(879,252),new Point(891,234),new Point(900,220),new Point(908,209),new Point(913,201),new Point(920,191),new Point(925,184),new Point(930,177),new Point(934,172),new Point(936,170),new Point(937,169),new Point(938,169),new Point(938,170),new Point(941,174),new Point(944,178),new Point(948,190),new Point(952,198),new Point(958,216),new Point(961,229),new Point(963,236),new Point(964,238),new Point(964,239),new Point(964,240),new Point(964,244),new Point(964,248),new Point(965,251),new Point(965,254),new Point(965,255),new Point(966,256),new Point(966,257)));
    this.Unistrokes[2] = new Unistroke("up", new Array(new Point(123,129),new Point(123,131),new Point(124,133),new Point(125,136),new Point(127,140),new Point(129,142),new Point(133,148),new Point(137,154),new Point(143,158),new Point(145,161),new Point(148,164),new Point(153,170),new Point(158,176),new Point(160,178),new Point(164,183),new Point(168,188),new Point(171,191),new Point(175,196),new Point(178,200),new Point(180,202),new Point(181,205),new Point(184,208),new Point(186,210),new Point(187,213),new Point(188,215),new Point(186,212),new Point(183,211),new Point(177,208),new Point(169,206),new Point(162,205),new Point(154,207),new Point(145,209),new Point(137,210),new Point(129,214),new Point(122,217),new Point(118,218),new Point(111,221),new Point(109,222),new Point(110,219),new Point(112,217),new Point(118,209),new Point(120,207),new Point(128,196),new Point(135,187),new Point(138,183),new Point(148,167),new Point(157,153),new Point(163,145),new Point(165,142),new Point(172,133),new Point(177,127),new Point(179,127),new Point(180,125)));

    //this.Unistrokes[3] = new Unistroke("down",new Array(new Point(500,123),new Point(504,125),new Point(504,129),new Point(504,135),new Point(505,138),new Point(508,142),new Point(508,146),new Point(510,155),new Point(512,162),new Point(510,163),new Point(506,171),new Point(501,178),new Point(496,186),new Point(496,187),new Point(502,191),new Point(510,196),new Point(517,201),new Point(525,206),new Point(532,211),new Point(531,211),new Point(527,219),new Point(524,227.81175639596097),new Point(520.2717695519103,235.92248970219066),new Point(516.4549538783905,244.03322300842035),new Point(516,245),new Point(517.7593034315931,252.69695251321997),new Point(519.7566897970619,261.43551786214596),new Point(521.7540761625307,270.17408321107195),new Point(523.7514625279995,278.91264855999793),new Point(524,280),new Point(525.6168810626021,287.68018504736017),new Point(527.463545003145,296.4518387649387),new Point(529.3102089436878,305.22349248251726),new Point(531.1568728842307,313.9951462000958),new Point(532,318),new Point(527.136479532586,317.7249794973784),new Point(518.1868449506243,317.21889897042223),new Point(509.2372103686625,316.71281844346606),new Point(500.2875757867007,316.2067379165099),new Point(491.3379412047389,315.7006573895537),new Point(482.3883066227771,315.19457686259756),new Point(473.43867204081533,314.6884963356414),new Point(464.48903745885355,314.1824158086852),new Point(455.53940287689176,313.67633528172905),new Point(446.58976829492997,313.1702547547729),new Point(437.6401337129682,312.6641742278167),new Point(428.6904991310064,312.15809370086055),new Point(419.7408645490446,311.6520131739044),new Point(410.7912299670828,311.1459326469482),new Point(401.841595385121,310.63985211999204),new Point(392.89196080315924,310.1337715930359),new Point(383.94232622119745,309.6276910660797),new Point(374.99269163923566,309.12161053912354),new Point(366.04305705727387,308.61553001216737),new Point(357.0934224753121,308.1094494852112),new Point(348.1437878933503,307.60336895825503),new Point(339.1941533113885,307.09728843129886),new Point(330.2445187294267,306.5912079043427),new Point(321.2948841474649,306.0851273773865),new Point(312.34524956550314,305.57904685043036),new Point(303.39561498354135,305.0729663234742),new Point(294.44598040157956,304.566885796518),new Point(285.4963458196178,304.06080526956185),new Point(276.546711237656,303.5547247426057),new Point(267.5970766556942,303.0486442156495),new Point(258.6474420737324,302.54256368869335),new Point(249.69780749177062,302.0364831617372),new Point(240.74817290980883,301.53040263478096),new Point(231.79853832784704,301.0243221078248),new Point(222.84890374588525,300.51824158086856),new Point(213.89926916392346,300.0121610539124),new Point(204.94963458196167,299.50608052695617),new Point(196,299)));
    //this.Unistrokes[3] = new Unistroke("down",new Array(new Point(834,141),new Point(837,148),new Point(847,167),new Point(858,193),new Point(888,253),new Point(907,288),new Point(924,318),new Point(933,330),new Point(937,336),new Point(939,340),new Point(940,340),new Point(940,341),new Point(942,341),new Point(947,337),new Point(961,326),new Point(971,314),new Point(980,303),new Point(997,274),new Point(1011,242),new Point(1035,199),new Point(1048,174),new Point(1054,164),new Point(1056,160),new Point(1057,158),new Point(1058,158),new Point(1058,157)));
    this.Unistrokes[3] = new Unistroke("down", new Array(new Point(127,141),new Point(124,140),new Point(120,139),new Point(118,139),new Point(116,139),new Point(111,140),new Point(109,141),new Point(104,144),new Point(100,147),new Point(96,152),new Point(93,157),new Point(90,163),new Point(87,169),new Point(85,175),new Point(83,181),new Point(82,190),new Point(82,195),new Point(83,200),new Point(84,205),new Point(88,213),new Point(91,216),new Point(96,219),new Point(103,222),new Point(108,224),new Point(111,224),new Point(120,224),new Point(133,223),new Point(142,222),new Point(152,218),new Point(160,214),new Point(167,210),new Point(173,204),new Point(178,198),new Point(179,196),new Point(182,188),new Point(182,177),new Point(178,167),new Point(170,150),new Point(163,138),new Point(152,130),new Point(143,129),new Point(140,131),new Point(129,136),new Point(126,139)));

    //this.Unistrokes[0] = new Unistroke("triangle", new Array(new Point(137,139),new Point(135,141),new Point(133,144),new Point(132,146),new Point(130,149),new Point(128,151),new Point(126,155),new Point(123,160),new Point(120,166),new Point(116,171),new Point(112,177),new Point(107,183),new Point(102,188),new Point(100,191),new Point(95,195),new Point(90,199),new Point(86,203),new Point(82,206),new Point(80,209),new Point(75,213),new Point(73,213),new Point(70,216),new Point(67,219),new Point(64,221),new Point(61,223),new Point(60,225),new Point(62,226),new Point(65,225),new Point(67,226),new Point(74,226),new Point(77,227),new Point(85,229),new Point(91,230),new Point(99,231),new Point(108,232),new Point(116,233),new Point(125,233),new Point(134,234),new Point(145,233),new Point(153,232),new Point(160,233),new Point(170,234),new Point(177,235),new Point(179,236),new Point(186,237),new Point(193,238),new Point(198,239),new Point(200,237),new Point(202,239),new Point(204,238),new Point(206,234),new Point(205,230),new Point(202,222),new Point(197,216),new Point(192,207),new Point(186,198),new Point(179,189),new Point(174,183),new Point(170,178),new Point(164,171),new Point(161,168),new Point(154,160),new Point(148,155),new Point(143,150),new Point(138,148),new Point(136,148)));
	//this.Unistrokes[1] = new Unistroke("x", new Array(new Point(87,142),new Point(89,145),new Point(91,148),new Point(93,151),new Point(96,155),new Point(98,157),new Point(100,160),new Point(102,162),new Point(106,167),new Point(108,169),new Point(110,171),new Point(115,177),new Point(119,183),new Point(123,189),new Point(127,193),new Point(129,196),new Point(133,200),new Point(137,206),new Point(140,209),new Point(143,212),new Point(146,215),new Point(151,220),new Point(153,222),new Point(155,223),new Point(157,225),new Point(158,223),new Point(157,218),new Point(155,211),new Point(154,208),new Point(152,200),new Point(150,189),new Point(148,179),new Point(147,170),new Point(147,158),new Point(147,148),new Point(147,141),new Point(147,136),new Point(144,135),new Point(142,137),new Point(140,139),new Point(135,145),new Point(131,152),new Point(124,163),new Point(116,177),new Point(108,191),new Point(100,206),new Point(94,217),new Point(91,222),new Point(89,225),new Point(87,226),new Point(87,224)));
	//this.Unistrokes[2] = new Unistroke("rectangle", new Array(new Point(78,149),new Point(78,153),new Point(78,157),new Point(78,160),new Point(79,162),new Point(79,164),new Point(79,167),new Point(79,169),new Point(79,173),new Point(79,178),new Point(79,183),new Point(80,189),new Point(80,193),new Point(80,198),new Point(80,202),new Point(81,208),new Point(81,210),new Point(81,216),new Point(82,222),new Point(82,224),new Point(82,227),new Point(83,229),new Point(83,231),new Point(85,230),new Point(88,232),new Point(90,233),new Point(92,232),new Point(94,233),new Point(99,232),new Point(102,233),new Point(106,233),new Point(109,234),new Point(117,235),new Point(123,236),new Point(126,236),new Point(135,237),new Point(142,238),new Point(145,238),new Point(152,238),new Point(154,239),new Point(165,238),new Point(174,237),new Point(179,236),new Point(186,235),new Point(191,235),new Point(195,233),new Point(197,233),new Point(200,233),new Point(201,235),new Point(201,233),new Point(199,231),new Point(198,226),new Point(198,220),new Point(196,207),new Point(195,195),new Point(195,181),new Point(195,173),new Point(195,163),new Point(194,155),new Point(192,145),new Point(192,143),new Point(192,138),new Point(191,135),new Point(191,133),new Point(191,130),new Point(190,128),new Point(188,129),new Point(186,129),new Point(181,132),new Point(173,131),new Point(162,131),new Point(151,132),new Point(149,132),new Point(138,132),new Point(136,132),new Point(122,131),new Point(120,131),new Point(109,130),new Point(107,130),new Point(90,132),new Point(81,133),new Point(76,133)));
	//this.Unistrokes[3] = new Unistroke("circle", new Array(new Point(127,141),new Point(124,140),new Point(120,139),new Point(118,139),new Point(116,139),new Point(111,140),new Point(109,141),new Point(104,144),new Point(100,147),new Point(96,152),new Point(93,157),new Point(90,163),new Point(87,169),new Point(85,175),new Point(83,181),new Point(82,190),new Point(82,195),new Point(83,200),new Point(84,205),new Point(88,213),new Point(91,216),new Point(96,219),new Point(103,222),new Point(108,224),new Point(111,224),new Point(120,224),new Point(133,223),new Point(142,222),new Point(152,218),new Point(160,214),new Point(167,210),new Point(173,204),new Point(178,198),new Point(179,196),new Point(182,188),new Point(182,177),new Point(178,167),new Point(170,150),new Point(163,138),new Point(152,130),new Point(143,129),new Point(140,131),new Point(129,136),new Point(126,139)));
	//this.Unistrokes[4] = new Unistroke("check", new Array(new Point(91,185),new Point(93,185),new Point(95,185),new Point(97,185),new Point(100,188),new Point(102,189),new Point(104,190),new Point(106,193),new Point(108,195),new Point(110,198),new Point(112,201),new Point(114,204),new Point(115,207),new Point(117,210),new Point(118,212),new Point(120,214),new Point(121,217),new Point(122,219),new Point(123,222),new Point(124,224),new Point(126,226),new Point(127,229),new Point(129,231),new Point(130,233),new Point(129,231),new Point(129,228),new Point(129,226),new Point(129,224),new Point(129,221),new Point(129,218),new Point(129,212),new Point(129,208),new Point(130,198),new Point(132,189),new Point(134,182),new Point(137,173),new Point(143,164),new Point(147,157),new Point(151,151),new Point(155,144),new Point(161,137),new Point(165,131),new Point(171,122),new Point(174,118),new Point(176,114),new Point(177,112),new Point(177,114),new Point(175,116),new Point(173,118)));
	//this.Unistrokes[5] = new Unistroke("caret", new Array(new Point(79,245),new Point(79,242),new Point(79,239),new Point(80,237),new Point(80,234),new Point(81,232),new Point(82,230),new Point(84,224),new Point(86,220),new Point(86,218),new Point(87,216),new Point(88,213),new Point(90,207),new Point(91,202),new Point(92,200),new Point(93,194),new Point(94,192),new Point(96,189),new Point(97,186),new Point(100,179),new Point(102,173),new Point(105,165),new Point(107,160),new Point(109,158),new Point(112,151),new Point(115,144),new Point(117,139),new Point(119,136),new Point(119,134),new Point(120,132),new Point(121,129),new Point(122,127),new Point(124,125),new Point(126,124),new Point(129,125),new Point(131,127),new Point(132,130),new Point(136,139),new Point(141,154),new Point(145,166),new Point(151,182),new Point(156,193),new Point(157,196),new Point(161,209),new Point(162,211),new Point(167,223),new Point(169,229),new Point(170,231),new Point(173,237),new Point(176,242),new Point(177,244),new Point(179,250),new Point(181,255),new Point(182,257)));
	//this.Unistrokes[6] = new Unistroke("zig-zag", new Array(new Point(307,216),new Point(333,186),new Point(356,215),new Point(375,186),new Point(399,216),new Point(418,186)));
	//this.Unistrokes[7] = new Unistroke("arrow", new Array(new Point(68,222),new Point(70,220),new Point(73,218),new Point(75,217),new Point(77,215),new Point(80,213),new Point(82,212),new Point(84,210),new Point(87,209),new Point(89,208),new Point(92,206),new Point(95,204),new Point(101,201),new Point(106,198),new Point(112,194),new Point(118,191),new Point(124,187),new Point(127,186),new Point(132,183),new Point(138,181),new Point(141,180),new Point(146,178),new Point(154,173),new Point(159,171),new Point(161,170),new Point(166,167),new Point(168,167),new Point(171,166),new Point(174,164),new Point(177,162),new Point(180,160),new Point(182,158),new Point(183,156),new Point(181,154),new Point(178,153),new Point(171,153),new Point(164,153),new Point(160,153),new Point(150,154),new Point(147,155),new Point(141,157),new Point(137,158),new Point(135,158),new Point(137,158),new Point(140,157),new Point(143,156),new Point(151,154),new Point(160,152),new Point(170,149),new Point(179,147),new Point(185,145),new Point(192,144),new Point(196,144),new Point(198,144),new Point(200,144),new Point(201,147),new Point(199,149),new Point(194,157),new Point(191,160),new Point(186,167),new Point(180,176),new Point(177,179),new Point(171,187),new Point(169,189),new Point(165,194),new Point(164,196)));
	//this.Unistrokes[8] = new Unistroke("left square bracket", new Array(new Point(140,124),new Point(138,123),new Point(135,122),new Point(133,123),new Point(130,123),new Point(128,124),new Point(125,125),new Point(122,124),new Point(120,124),new Point(118,124),new Point(116,125),new Point(113,125),new Point(111,125),new Point(108,124),new Point(106,125),new Point(104,125),new Point(102,124),new Point(100,123),new Point(98,123),new Point(95,124),new Point(93,123),new Point(90,124),new Point(88,124),new Point(85,125),new Point(83,126),new Point(81,127),new Point(81,129),new Point(82,131),new Point(82,134),new Point(83,138),new Point(84,141),new Point(84,144),new Point(85,148),new Point(85,151),new Point(86,156),new Point(86,160),new Point(86,164),new Point(86,168),new Point(87,171),new Point(87,175),new Point(87,179),new Point(87,182),new Point(87,186),new Point(88,188),new Point(88,195),new Point(88,198),new Point(88,201),new Point(88,207),new Point(89,211),new Point(89,213),new Point(89,217),new Point(89,222),new Point(88,225),new Point(88,229),new Point(88,231),new Point(88,233),new Point(88,235),new Point(89,237),new Point(89,240),new Point(89,242),new Point(91,241),new Point(94,241),new Point(96,240),new Point(98,239),new Point(105,240),new Point(109,240),new Point(113,239),new Point(116,240),new Point(121,239),new Point(130,240),new Point(136,237),new Point(139,237),new Point(144,238),new Point(151,237),new Point(157,236),new Point(159,237)));
	//this.Unistrokes[9] = new Unistroke("right square bracket", new Array(new Point(112,138),new Point(112,136),new Point(115,136),new Point(118,137),new Point(120,136),new Point(123,136),new Point(125,136),new Point(128,136),new Point(131,136),new Point(134,135),new Point(137,135),new Point(140,134),new Point(143,133),new Point(145,132),new Point(147,132),new Point(149,132),new Point(152,132),new Point(153,134),new Point(154,137),new Point(155,141),new Point(156,144),new Point(157,152),new Point(158,161),new Point(160,170),new Point(162,182),new Point(164,192),new Point(166,200),new Point(167,209),new Point(168,214),new Point(168,216),new Point(169,221),new Point(169,223),new Point(169,228),new Point(169,231),new Point(166,233),new Point(164,234),new Point(161,235),new Point(155,236),new Point(147,235),new Point(140,233),new Point(131,233),new Point(124,233),new Point(117,235),new Point(114,238),new Point(112,238)));
	//this.Unistrokes[10] = new Unistroke("v", new Array(new Point(89,164),new Point(90,162),new Point(92,162),new Point(94,164),new Point(95,166),new Point(96,169),new Point(97,171),new Point(99,175),new Point(101,178),new Point(103,182),new Point(106,189),new Point(108,194),new Point(111,199),new Point(114,204),new Point(117,209),new Point(119,214),new Point(122,218),new Point(124,222),new Point(126,225),new Point(128,228),new Point(130,229),new Point(133,233),new Point(134,236),new Point(136,239),new Point(138,240),new Point(139,242),new Point(140,244),new Point(142,242),new Point(142,240),new Point(142,237),new Point(143,235),new Point(143,233),new Point(145,229),new Point(146,226),new Point(148,217),new Point(149,208),new Point(149,205),new Point(151,196),new Point(151,193),new Point(153,182),new Point(155,172),new Point(157,165),new Point(159,160),new Point(162,155),new Point(164,150),new Point(165,148),new Point(166,146)));
	//this.Unistrokes[11] = new Unistroke("delete", new Array(new Point(123,129),new Point(123,131),new Point(124,133),new Point(125,136),new Point(127,140),new Point(129,142),new Point(133,148),new Point(137,154),new Point(143,158),new Point(145,161),new Point(148,164),new Point(153,170),new Point(158,176),new Point(160,178),new Point(164,183),new Point(168,188),new Point(171,191),new Point(175,196),new Point(178,200),new Point(180,202),new Point(181,205),new Point(184,208),new Point(186,210),new Point(187,213),new Point(188,215),new Point(186,212),new Point(183,211),new Point(177,208),new Point(169,206),new Point(162,205),new Point(154,207),new Point(145,209),new Point(137,210),new Point(129,214),new Point(122,217),new Point(118,218),new Point(111,221),new Point(109,222),new Point(110,219),new Point(112,217),new Point(118,209),new Point(120,207),new Point(128,196),new Point(135,187),new Point(138,183),new Point(148,167),new Point(157,153),new Point(163,145),new Point(165,142),new Point(172,133),new Point(177,127),new Point(179,127),new Point(180,125)));
	//this.Unistrokes[12] = new Unistroke("left curly brace", new Array(new Point(150,116),new Point(147,117),new Point(145,116),new Point(142,116),new Point(139,117),new Point(136,117),new Point(133,118),new Point(129,121),new Point(126,122),new Point(123,123),new Point(120,125),new Point(118,127),new Point(115,128),new Point(113,129),new Point(112,131),new Point(113,134),new Point(115,134),new Point(117,135),new Point(120,135),new Point(123,137),new Point(126,138),new Point(129,140),new Point(135,143),new Point(137,144),new Point(139,147),new Point(141,149),new Point(140,152),new Point(139,155),new Point(134,159),new Point(131,161),new Point(124,166),new Point(121,166),new Point(117,166),new Point(114,167),new Point(112,166),new Point(114,164),new Point(116,163),new Point(118,163),new Point(120,162),new Point(122,163),new Point(125,164),new Point(127,165),new Point(129,166),new Point(130,168),new Point(129,171),new Point(127,175),new Point(125,179),new Point(123,184),new Point(121,190),new Point(120,194),new Point(119,199),new Point(120,202),new Point(123,207),new Point(127,211),new Point(133,215),new Point(142,219),new Point(148,220),new Point(151,221)));
	//this.Unistrokes[13] = new Unistroke("right curly brace", new Array(new Point(117,132),new Point(115,132),new Point(115,129),new Point(117,129),new Point(119,128),new Point(122,127),new Point(125,127),new Point(127,127),new Point(130,127),new Point(133,129),new Point(136,129),new Point(138,130),new Point(140,131),new Point(143,134),new Point(144,136),new Point(145,139),new Point(145,142),new Point(145,145),new Point(145,147),new Point(145,149),new Point(144,152),new Point(142,157),new Point(141,160),new Point(139,163),new Point(137,166),new Point(135,167),new Point(133,169),new Point(131,172),new Point(128,173),new Point(126,176),new Point(125,178),new Point(125,180),new Point(125,182),new Point(126,184),new Point(128,187),new Point(130,187),new Point(132,188),new Point(135,189),new Point(140,189),new Point(145,189),new Point(150,187),new Point(155,186),new Point(157,185),new Point(159,184),new Point(156,185),new Point(154,185),new Point(149,185),new Point(145,187),new Point(141,188),new Point(136,191),new Point(134,191),new Point(131,192),new Point(129,193),new Point(129,195),new Point(129,197),new Point(131,200),new Point(133,202),new Point(136,206),new Point(139,211),new Point(142,215),new Point(145,220),new Point(147,225),new Point(148,231),new Point(147,239),new Point(144,244),new Point(139,248),new Point(134,250),new Point(126,253),new Point(119,253),new Point(115,253)));
	//this.Unistrokes[14] = new Unistroke("star", new Array(new Point(75,250),new Point(75,247),new Point(77,244),new Point(78,242),new Point(79,239),new Point(80,237),new Point(82,234),new Point(82,232),new Point(84,229),new Point(85,225),new Point(87,222),new Point(88,219),new Point(89,216),new Point(91,212),new Point(92,208),new Point(94,204),new Point(95,201),new Point(96,196),new Point(97,194),new Point(98,191),new Point(100,185),new Point(102,178),new Point(104,173),new Point(104,171),new Point(105,164),new Point(106,158),new Point(107,156),new Point(107,152),new Point(108,145),new Point(109,141),new Point(110,139),new Point(112,133),new Point(113,131),new Point(116,127),new Point(117,125),new Point(119,122),new Point(121,121),new Point(123,120),new Point(125,122),new Point(125,125),new Point(127,130),new Point(128,133),new Point(131,143),new Point(136,153),new Point(140,163),new Point(144,172),new Point(145,175),new Point(151,189),new Point(156,201),new Point(161,213),new Point(166,225),new Point(169,233),new Point(171,236),new Point(174,243),new Point(177,247),new Point(178,249),new Point(179,251),new Point(180,253),new Point(180,255),new Point(179,257),new Point(177,257),new Point(174,255),new Point(169,250),new Point(164,247),new Point(160,245),new Point(149,238),new Point(138,230),new Point(127,221),new Point(124,220),new Point(112,212),new Point(110,210),new Point(96,201),new Point(84,195),new Point(74,190),new Point(64,182),new Point(55,175),new Point(51,172),new Point(49,170),new Point(51,169),new Point(56,169),new Point(66,169),new Point(78,168),new Point(92,166),new Point(107,164),new Point(123,161),new Point(140,162),new Point(156,162),new Point(171,160),new Point(173,160),new Point(186,160),new Point(195,160),new Point(198,161),new Point(203,163),new Point(208,163),new Point(206,164),new Point(200,167),new Point(187,172),new Point(174,179),new Point(172,181),new Point(153,192),new Point(137,201),new Point(123,211),new Point(112,220),new Point(99,229),new Point(90,237),new Point(80,244),new Point(73,250),new Point(69,254),new Point(69,252)));
	//this.Unistrokes[15] = new Unistroke("pigtail", new Array(new Point(81,219),new Point(84,218),new Point(86,220),new Point(88,220),new Point(90,220),new Point(92,219),new Point(95,220),new Point(97,219),new Point(99,220),new Point(102,218),new Point(105,217),new Point(107,216),new Point(110,216),new Point(113,214),new Point(116,212),new Point(118,210),new Point(121,208),new Point(124,205),new Point(126,202),new Point(129,199),new Point(132,196),new Point(136,191),new Point(139,187),new Point(142,182),new Point(144,179),new Point(146,174),new Point(148,170),new Point(149,168),new Point(151,162),new Point(152,160),new Point(152,157),new Point(152,155),new Point(152,151),new Point(152,149),new Point(152,146),new Point(149,142),new Point(148,139),new Point(145,137),new Point(141,135),new Point(139,135),new Point(134,136),new Point(130,140),new Point(128,142),new Point(126,145),new Point(122,150),new Point(119,158),new Point(117,163),new Point(115,170),new Point(114,175),new Point(117,184),new Point(120,190),new Point(125,199),new Point(129,203),new Point(133,208),new Point(138,213),new Point(145,215),new Point(155,218),new Point(164,219),new Point(166,219),new Point(177,219),new Point(182,218),new Point(192,216),new Point(196,213),new Point(199,212),new Point(201,211)));
	//
	// The $1 Gesture Recognizer API begins here -- 3 methods: Recognize(), AddGesture(), and DeleteUserGestures()
	//
	this.Recognize = function(points, useProtractor)
	{
		points = Resample(points, NumPoints);
		var radians = IndicativeAngle(points);
		points = RotateBy(points, -radians);
		points = ScaleTo(points, SquareSize);
		points = TranslateTo(points, Origin);
		var vector = Vectorize(points); // for Protractor

		var b = +Infinity;
		var u = -1;
		for (var i = 0; i < this.Unistrokes.length; i++) // for each unistroke
		{
			var d;
			if (useProtractor) // for Protractor
				d = OptimalCosineDistance(this.Unistrokes[i].Vector, vector);
			else // Golden Section Search (original $1)
				d = DistanceAtBestAngle(points, this.Unistrokes[i], -AngleRange, +AngleRange, AnglePrecision);
			if (d < b) {
				b = d; // best (least) distance
				u = i; // unistroke
			}
		}
		return (u == -1) ? new Result("No match.", 0.0) : new Result(this.Unistrokes[u].Name, useProtractor ? 1.0 / b : 1.0 - b / HalfDiagonal);
	};
	this.AddGesture = function(name, points)
	{
		this.Unistrokes[this.Unistrokes.length] = new Unistroke(name, points); // append new unistroke
		var num = 0;
		for (var i = 0; i < this.Unistrokes.length; i++) {
			if (this.Unistrokes[i].Name == name)
				num++;
		}
		return num;
	}
	this.DeleteUserGestures = function()
	{
		this.Unistrokes.length = NumUnistrokes; // clear any beyond the original set
		return NumUnistrokes;
	}
}

function PPTRecognizer() // constructor
{
    //
    // one built-in unistroke per gesture type
    //
    this.Unistrokes = new Array(2);
    this.Unistrokes[0] = new Unistroke("right", new Array(new Point(883,95),new Point(883,98),new Point(883,101),new Point(883,108),new Point(883,115),new Point(883,125),new Point(883,144),new Point(883,156),new Point(883,167),new Point(885,186),new Point(885,199),new Point(886,208),new Point(888,218),new Point(888,224),new Point(888,229),new Point(889,239),new Point(889,247),new Point(889,257),new Point(889,261),new Point(889,264),new Point(889,265),new Point(889,266),new Point(889,267),new Point(889,268),new Point(889,270),new Point(889,271),new Point(889,272),new Point(889,273),new Point(890,274),new Point(892,274),new Point(893,274),new Point(897,274),new Point(901,274),new Point(910,274),new Point(919,274),new Point(926,274),new Point(936,274),new Point(941,274),new Point(944,274),new Point(947,273),new Point(948,273),new Point(951,272),new Point(955,272),new Point(958,271),new Point(961,271)));

    this.Unistrokes[1] = new Unistroke("left", new Array(new Point(933,164),new Point(934,165),new Point(937,167),new Point(941,170),new Point(948,178),new Point(961,190),new Point(981,208),new Point(1002,227),new Point(1015,238),new Point(1022,247),new Point(1029,256),new Point(1035,265),new Point(1039,274),new Point(1042,281),new Point(1044,286),new Point(1045,288),new Point(1045,290),new Point(1045,291),new Point(1045,292),new Point(1040,294),new Point(1017,309),new Point(998,319),new Point(979,331),new Point(967,335),new Point(963,338),new Point(960,338),new Point(959,339),new Point(958,339),new Point(957,339),new Point(956,340),new Point(953,342),new Point(949,344),new Point(946,346),new Point(942,348),new Point(940,349),new Point(939,349),new Point(938,350),new Point(938,351)));

    //
    // The $1 Gesture Recognizer API begins here -- 3 methods: Recognize(), AddGesture(), and DeleteUserGestures()
    //
    this.Recognize = function(points, useProtractor)
    {
        points = Resample(points, NumPoints);
        var radians = IndicativeAngle(points);
        points = RotateBy(points, -radians);
        points = ScaleTo(points, SquareSize);
        points = TranslateTo(points, Origin);
        var vector = Vectorize(points); // for Protractor

        var b = +Infinity;
        var u = -1;
        for (var i = 0; i < this.Unistrokes.length; i++) // for each unistroke
        {
            var d;
            if (useProtractor) // for Protractor
                d = OptimalCosineDistance(this.Unistrokes[i].Vector, vector);
            else // Golden Section Search (original $1)
                d = DistanceAtBestAngle(points, this.Unistrokes[i], -AngleRange, +AngleRange, AnglePrecision);
            if (d < b) {
                b = d; // best (least) distance
                u = i; // unistroke
            }
        }
        return (u == -1) ? new Result("No match.", 0.0) : new Result(this.Unistrokes[u].Name, useProtractor ? 1.0 / b : 1.0 - b / HalfDiagonal);
    };
    this.AddGesture = function(name, points)
    {
        this.Unistrokes[this.Unistrokes.length] = new Unistroke(name, points); // append new unistroke
        var num = 0;
        for (var i = 0; i < this.Unistrokes.length; i++) {
            if (this.Unistrokes[i].Name == name)
                num++;
        }
        return num;
    }
    this.DeleteUserGestures = function()
    {
        this.Unistrokes.length = NumUnistrokes; // clear any beyond the original set
        return NumUnistrokes;
    }
}

//
// Private helper functions from this point down
//
function Resample(points, n)
{
	var I = PathLength(points) / (n - 1); // interval length
	var D = 0.0;
	var newpoints = new Array(points[0]);
	for (var i = 1; i < points.length; i++)
	{
		var d = Distance(points[i - 1], points[i]);
		if ((D + d) >= I)
		{
			var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
			var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
			var q = new Point(qx, qy);
			newpoints[newpoints.length] = q; // append new point 'q'
			points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
			D = 0.0;
		}
		else D += d;
	}
	if (newpoints.length == n - 1) // somtimes we fall a rounding-error short of adding the last point, so add it if so
		newpoints[newpoints.length] = new Point(points[points.length - 1].X, points[points.length - 1].Y);
	return newpoints;
}
function IndicativeAngle(points)
{
	var c = Centroid(points);
	return Math.atan2(c.Y - points[0].Y, c.X - points[0].X);
}
function RotateBy(points, radians) // rotates points around centroid
{
	var c = Centroid(points);
	var cos = Math.cos(radians);
	var sin = Math.sin(radians);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = (points[i].X - c.X) * cos - (points[i].Y - c.Y) * sin + c.X
		var qy = (points[i].X - c.X) * sin + (points[i].Y - c.Y) * cos + c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function ScaleTo(points, size) // non-uniform scale; assumes 2D gestures (i.e., no lines)
{
	var B = BoundingBox(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X * (size / B.Width);
		var qy = points[i].Y * (size / B.Height);
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function TranslateTo(points, pt) // translates points' centroid
{
	var c = Centroid(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X + pt.X - c.X;
		var qy = points[i].Y + pt.Y - c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function Vectorize(points) // for Protractor
{
	var sum = 0.0;
	var vector = new Array();
	for (var i = 0; i < points.length; i++) {
		vector[vector.length] = points[i].X;
		vector[vector.length] = points[i].Y;
		sum += points[i].X * points[i].X + points[i].Y * points[i].Y;
	}
	var magnitude = Math.sqrt(sum);
	for (var i = 0; i < vector.length; i++)
		vector[i] /= magnitude;
	return vector;
}
function OptimalCosineDistance(v1, v2) // for Protractor
{
	var a = 0.0;
	var b = 0.0;
	for (var i = 0; i < v1.length; i += 2) {
		a += v1[i] * v2[i] + v1[i + 1] * v2[i + 1];
                b += v1[i] * v2[i + 1] - v1[i + 1] * v2[i];
	}
	var angle = Math.atan(b / a);
	return Math.acos(a * Math.cos(angle) + b * Math.sin(angle));
}
function DistanceAtBestAngle(points, T, a, b, threshold)
{
	var x1 = Phi * a + (1.0 - Phi) * b;
	var f1 = DistanceAtAngle(points, T, x1);
	var x2 = (1.0 - Phi) * a + Phi * b;
	var f2 = DistanceAtAngle(points, T, x2);
	while (Math.abs(b - a) > threshold)
	{
		if (f1 < f2) {
			b = x2;
			x2 = x1;
			f2 = f1;
			x1 = Phi * a + (1.0 - Phi) * b;
			f1 = DistanceAtAngle(points, T, x1);
		} else {
			a = x1;
			x1 = x2;
			f1 = f2;
			x2 = (1.0 - Phi) * a + Phi * b;
			f2 = DistanceAtAngle(points, T, x2);
		}
	}
	return Math.min(f1, f2);
}
function DistanceAtAngle(points, T, radians)
{
	var newpoints = RotateBy(points, radians);
	return PathDistance(newpoints, T.Points);
}
function Centroid(points)
{
	var x = 0.0, y = 0.0;
	for (var i = 0; i < points.length; i++) {
		x += points[i].X;
		y += points[i].Y;
	}
	x /= points.length;
	y /= points.length;
	return new Point(x, y);
}
function BoundingBox(points)
{
	var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
	for (var i = 0; i < points.length; i++) {
		minX = Math.min(minX, points[i].X);
		minY = Math.min(minY, points[i].Y);
		maxX = Math.max(maxX, points[i].X);
		maxY = Math.max(maxY, points[i].Y);
	}
	return new Rectangle(minX, minY, maxX - minX, maxY - minY);
}
function PathDistance(pts1, pts2)
{
	var d = 0.0;
	for (var i = 0; i < pts1.length; i++) // assumes pts1.length == pts2.length
		d += Distance(pts1[i], pts2[i]);
	return d / pts1.length;
}
function PathLength(points)
{
	var d = 0.0;
	for (var i = 1; i < points.length; i++)
		d += Distance(points[i - 1], points[i]);
	return d;
}
function Distance(p1, p2)
{
	var dx = p2.X - p1.X;
	var dy = p2.Y - p1.Y;
	return Math.sqrt(dx * dx + dy * dy);
}
function Deg2Rad(d) { return (d * Math.PI / 180.0); }