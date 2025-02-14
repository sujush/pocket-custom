'use client'

import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, PlusCircle, Trash2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// 타입 정의
type CategoryType = '가공식품' | '기구ㆍ용기등' | null;
type FeatureType = '한글표시사항 작성' | '검사비용 확인' | null;
type GlassType =
    | "유리제 (비가열조리용) 포함"
    | "유리제 (열탕용) 포함"
    | "유리제 (전자레인지용) 포함"
    | "유리제 (오븐용) 포함"
    | "유리제 (직화용) 포함"
    | "해당사항 없음"
    | null;

// 인터페이스 정의
interface MaterialCost {
    cost: number;
}

interface SubCategory {
    [key: string]: MaterialCost;
}

interface MidCategory {
    [key: string]: SubCategory;
}

interface MainCategory {
    [key: string]: MidCategory;
}

interface CostSelection {
    id: string;
    mainCategory: string;
    midCategory: string;
    subCategory: string;
    cost: number;
}

interface FormDataType {
    productName: string;
    material: string;
    manufacturer: string;
    importer: string;
    address: string;
    contact: string;
    origin: string;
}

// 수정 후:
interface ProcessedFoodResultType extends ProcessedFoodFormData {
    additionalText: string;
    allergenInfo: string;
    gmoInfo: string;
}

interface ContainerResultType extends FormDataType {
    additionalText: string;
}

type ResultType = ProcessedFoodResultType | ContainerResultType;

interface CategoryItem {
    id: CategoryType;
    label: string;
    description: string;
}

interface FeatureItem {
    id: FeatureType;
    label: string;
    description: string;
}

interface FormField {
    id: keyof FormDataType;
    label: string;
}

interface StepProps {
    number: string;
    title: string;
    active: boolean;
}

// FoodType 인터페이스를 ProcessedFoodCategory 인터페이스로 변경
interface ProcessedFoodCost {
    cost: number;
}

interface ProcessedFoodSubCategory {
    [key: string]: ProcessedFoodCost;
}

interface ProcessedFoodMidCategory {
    [key: string]: ProcessedFoodSubCategory;
}

interface ProcessedFoodMainCategory {
    [key: string]: ProcessedFoodMidCategory;
}

interface ProcessedFoodFormData extends Omit<FormDataType, 'manufacturer'> {
    foodType: string;
    businessInfo: string;
    manufacturerName: string;
    manufacturer: string;  // 추가
    manufactureDate: string;
    expiryDate: string;
    contentAndCalories: string;
    ingredients: string;
    packagingMaterial: string;
    storageMethod: string;
    allergens: string[];
    gmoIngredients: string[];
    sterilizationType: 'none' | 'sterilized' | 'sanitized';
    nutritionLabeling: {
        required: boolean;
        values: NutritionValues;
    }
}

type NutrientId = 'calories' | 'sodium' | 'carbohydrate' | 'sugars' | 'fat' | 'transFat' | 'saturatedFat' | 'cholesterol' | 'protein';

interface NutritionValues {
    calories: number;
    sodium: number;
    carbohydrate: number;
    sugars: number;
    fat: number;
    transFat: number;
    saturatedFat: number;
    cholesterol: number;
    protein: number;
}

const ALLERGENS = [
    '알류(가금류만 해당)', '우유', '메밀', '땅콩', '대두', '밀', '고등어',
    '게', '새우', '돼지고기', '복숭아', '토마토',
    '아황산류', '호두', '닭고기', '쇠고기', '오징어',
    '조개류', '잣'
];

const GMO_INGREDIENTS = [
    '대두', '옥수수', '면화', '카놀라', '사탕무', '알팔파', '감자'
];

const STERILIZATION_TYPES = [
    { value: 'none', label: '해당 사항 없음' },
    { value: 'sterilized', label: '멸균제품' },
    { value: 'sanitized', label: '살균제품' }
];


// materialsData 정의
const materialsData: MainCategory = {
    "합성수지제": {
        "올레핀계": {
            "에틸렌-초산비닐 공중합체(EVA)": { cost: 146000 },
            "폴리메틸펜텐(PMP)": { cost: 194000 },
            "폴리부텐(PB-1)": { cost: 99000 },
            "폴리비닐알코올(PVA)": { cost: 146000 },
            "폴리에틸렌(PE)": { cost: 213000 },
            "폴리프로필렌(PP)": { cost: 99000 }
        },
        "에스테르계": {
            "경화폴리에스터수지": { cost: 339000 },
            "부틸렌숙시네이트-아디페이트공중합체(PBSA)": { cost: 305000 },
            "부틸렌숙시네이트 공중항체(PBS)": { cost: 305000 },
            "폴리부틸렌테레프탈레이트(PBT)": { cost: 412000 },
            "폴리시클로헥산-1,4-디메틸렌테레프탈레이트(PCT)": { cost: 376000 },
            "폴리아릴레이트(PAR)": { cost: 417000 },
            "폴리에틸렌나프탈레이트(PEN)": { cost: 215000 },
            "폴리에틸렌테레프탈레이트(PET)": { cost: 538000 },
            "폴리락타이드(PLA)": { cost: 234000 },
            "폴리카보네이트(PC)": { cost: 295000 },
            "히드록시부틸폴리에스테르(HBP)": { cost: 99000 },
            "폴리부틸렌아디페이트테레프날레이트(PBAT)": { cost: 412000 },
            "히드록시안식향산폴리에스테르": { cost: 99000 }
        },
        "스티렌계": {
            "메틸메타크릴레이트-아크릴로니트릴-부다티엔- 스티렌공중합체(MABS)": { cost: 378000 },
            "아크릴로니트릴-부다티엔-스티렌 공중합체(ABS)": { cost: 318000 },
            "아크릴로니트릴-스티렌(AS)": { cost: 224000 },
            "폴리메타크릴스티렌(MS)": { cost: 213000 },
            "폴리스티렌(PS)": { cost: 153000 }
        },
        "아민계": {
            "폴리아미드(PA)": { cost: 451000 },
            "폴리우레탄(PU)": { cost: 313000 },
            "폴리이미드(PI)": { cost: 999000 }
        },
        "아크릴계": {
            "아크릴수지": { cost: 159000 },
            "이오노머 수지": { cost: 99000 },
            "폴리아크릴로니트릴(PAN)": { cost: 170000 },
            "멜라민수지(MF)": { cost: 303000 },
            "요소수지(UF)": { cost: 232000 },
            "페놀수지(PF)": { cost: 232000 },
            "폴리아세탈(POM)": { cost: 190000 }
        },
        "에테르계": {
            "폴리아릴설폰(PASF)": { cost: 255000 },
            "폴리에테르에테르케톤(PEEK)": { cost: 173000 },
            "폴리에테르설폰(PES)": { cost: 259000 },
            "폴리페닐렌설파이드(PPS)": { cost: 177000 },
            "폴리페닐렌에테르(PPE)": { cost: 153000 },
        },
        "염화비닐계": {
            "폴리염화비닐(PVC)": { cost: 544000 },
            "폴리염화비닐리덴(PVDC)": { cost: 237000 }
        },
        "기타": {
            "불소수지(FR)": { cost: 99000 },
            "에폭시수지": { cost: 602000 },
            "폴리케톤(PK)": { cost: 99000 }
        }
    },
    "가공셀룰로오스제": {
        "가공셀룰로오스제": {
            "가공셀룰로오스제": { cost: 108000 }
        }
    },
    "고무제": {
        "고무제": {
            "고무제": { cost: 414000 }
        }
    },
    "종이제": {
        "종이제": {
            "종이제": { cost: 477000 }
        }
    },
    "금속제": {
        "금속제": {
            "금속제": { cost: 267000 }
        }
    },
    "목재류": {
        목재류: {
            목재류: { cost: 644000 }
        }
    },
    "유리제,도자기제,법랑및옹기류": {
        "유리제,도자기제,법랑및옹기류": {
            "유리제": { cost: 100000 },
            "도자기": { cost: 100000 },
            "법랑": { cost: 148000 }
        }
    },
    "전분제": {
        "전분제": {
            "전분제": { cost: 234000 }
        }
    }

};

type ProcessedFoodStringFields = {
    [K in keyof ProcessedFoodFormData]: ProcessedFoodFormData[K] extends string ? K : never
}[keyof ProcessedFoodFormData];

export default function CertifiedFoodInspection(): JSX.Element {
    // 상태 관리
    const [category, setCategory] = useState<CategoryType>(null)
    const [feature, setFeature] = useState<FeatureType>(null)
    const [result, setResult] = useState<ResultType | null>(null)
    const [glassType, setGlassType] = useState<GlassType>(null)
    const [formData, setFormData] = useState<FormDataType>({
        productName: '',
        material: '',
        manufacturer: '',
        importer: '',
        address: '',
        contact: '',
        origin: ''
    })
    const [showTable, setShowTable] = useState<boolean>(false)
    const [selections, setSelections] = useState<CostSelection[]>([{
        id: '1',
        mainCategory: '',
        midCategory: '',
        subCategory: '',
        cost: 0
    }])
    const [totalCost, setTotalCost] = useState<number>(0)
    // 가공식품 한글표시사항 
    const [processedFoodForm, setProcessedFoodForm] = useState<ProcessedFoodFormData>({
        productName: '',
        foodType: '',
        businessInfo: '',
        manufacturerName: '',
        manufacturer: '',  // 추가
        manufactureDate: '',
        expiryDate: '',
        contentAndCalories: '',
        ingredients: '',
        packagingMaterial: '',
        storageMethod: '',
        // FormDataType에서 상속된 필드들 추가
        material: '',
        importer: '',
        address: '',
        contact: '',
        origin: '',
        // 기존 필드들...
        allergens: [],
        gmoIngredients: [],
        sterilizationType: 'none',
        nutritionLabeling: {
            required: false,
            values: {
                calories: 0,
                sodium: 0,
                carbohydrate: 0,
                sugars: 0,
                fat: 0,
                transFat: 0,
                saturatedFat: 0,
                cholesterol: 0,
                protein: 0
            }
        }
    });

    // 상수 데이터

    const processedFoodData: ProcessedFoodMainCategory = {
        "과자류,빵류,또는 떡류": {
            "과자류,빵류,또는 떡류": {
                "과자": { cost: 594000 },
                "캔디류": { cost: 567000 },
                "추잉껌": { cost: 336000 },
                "빵류": { cost: 508000 },
                "떡류": { cost: 220000 }
            }
        },
        "빙과류": {
            "빙과": {
                "빙과": { cost: 161000 }
            },
            "얼음류": {
                "식용얼음": { cost: 390000 },
                "어업용얼음": { cost: 173000 }
            }
        },
        "코코아가공품류 또는 초콜릿류": {
            "코코아가공품류": {
                "코코아매스": { cost: 76000 },
                "코코아버터": { cost: 106000 },
                "코코아분말": { cost: 136000 },
                "기타코코아가공품": { cost: 76000 }
            },
            "초콜릿류": {
                "초콜릿/밀크초콜릿/화이트초콜릿/준초콜릿": { cost: 278000 },
                "초콜릿가공품": { cost: 418000 }
            }
        },
        "당류": {
            "설탕류": {
                "설탕": { cost: 165000 },
                "기타설탕": { cost: 165000 }
            },
            "당시럽류": {
                "당시럽류": { cost: 161000 }
            },
            "올리고당류": {
                "올리고당/올리고당가공품": { cost: 537000 }
            },
            "포도당": {
                "포도당": { cost: 167000 }
            },
            "과당류": {
                "과당": { cost: 337000 },
                "기타과당": { cost: 157000 }
            },
            "엿류": {
                "물엿/기타엿/덱스트린": { cost: 140000 }
            },
            "당류가공품": {
                "당류가공품": { cost: 281000 }
            }
        },
        "잼류": {
            "잼류": {
                "잼": { cost: 327000 },
                "기타잼": { cost: 285000 }
            }
        },
        "두부류 또는 묵류": {
            "두부류 또는 묵류": {
                "두부/유바/가공두부/묵류": { cost: 262000 }
            }
        },
        "식용유지류": {
            "식물성유지류": {
                "콩기름(대두유)": { cost: 329000 },
                "옥수수기름(옥배유)": { cost: 329000 },
                "채종유(유채유 또는 카놀라유)": { cost: 329000 },
                "미강유(현미유)": { cost: 329000 },
                "참기름": { cost: 509000 },
                "추출참깨유": { cost: 329000 },
                "들기름": { cost: 404000 },
                "추출들깨유": { cost: 404000 },
                "홍화유(사플라워유 또는 잇꽃유": { cost: 329000 },
                "해바라기유": { cost: 329000 },
                "목화씨기름(면실유)": { cost: 449000 },
                "땅콩기름(낙화생유": { cost: 544000 },
                "올리브유": { cost: 329000 },
                "팜유": { cost: 329000 },
                "팜올레인유": { cost: 317000 },
                "팜스테아린유": { cost: 317000 },
                "팜핵유": { cost: 329000 },
                "야자유": { cost: 329000 },
                "고추씨기름": { cost: 329000 },
                "기타식물성유지": { cost: 374000 }
            },
            "동물성유지류": {
                "어유": { cost: 484000 },
                "기타동물성유지": { cost: 374000 }
            },
            "식용유지가공품": {
                "혼합식용유": { cost: 374000 },
                "향미유": { cost: 341000 },
                "가공유지": { cost: 554000 },
                "쇼트닝": { cost: 374000 },
                "마가린": { cost: 581000 },
                "모조치즈": { cost: 122000 },
                "식물성크림": { cost: 92000 },
                "기타식용유지가공품": { cost: 189000 }
            }
        },
        "면류": {
            "면류": {
                "생면/숙면/건면/유탕면": { cost: 482000 }
            }
        },
        "음료류": {
            "다류": {
                "침출차": { cost: 1797000 },
                "액상차": { cost: 383000 },
                "고형차": { cost: 500000 }
            },
            "커피": {
                "커피": { cost: 463000 }
            },
            "과일채소류음료": {
                "농축과채즙/과채주스": { cost: 496000 },
                "과채음료": { cost: 496000 }
            },
            "탄산음료류": {
                "탄산음료": { cost: 342000 },
                "탄산수": { cost: 361000 }
            },
            "두유류": {
                "원액두유/가공두유": { cost: 161000 }
            },
            "발효음료류": {
                "유산균음료/효모음료/기타발효음료": { cost: 328000 }
            },
            "인삼,홍삼음료": {
                "인삼,홍삼음료": { cost: 508000 }
            },
            "기타 음료": {
                "혼합음료/음료베이스": { cost: 445000 }
            }
        },
        "특수영양식품": {
            "영아용조제식": {
                "영아용조제식": { cost: 2858000 }
            },
            "성장기용조제식": {
                "성장기용조제식": { cost: 2643000 }
            },
            "영유아용이유식": {
                "영유아용이유식": { cost: 690000 }
            },
            "체중조절용 조제식품": {
                "체중조절용 조제식품": { cost: 1402000 }
            },
            "임산ㆍ수유부용 식품": {
                "임산ㆍ수유부용 식품": { cost: 215000 }
            },
            "고령자용 영양조제식품": {
                "고령자용 영양조제식품": { cost: 639000 }
            }
        },
        "장류": {
            "장류": {
                "한식메주": { cost: 274000 },
                "개량메주": { cost: 274000 },
                "한식간장": { cost: 287000 },
                "양조간장": { cost: 287000 },
                "산분해간장": { cost: 433000 },
                "효소분해간장": { cost: 287000 },
                "혼합간장": { cost: 287000 },
                "한식된장": { cost: 257000 },
                "된장": { cost: 257000 },
                "고추장": { cost: 257000 },
                "춘장": { cost: 257000 },
                "청국장": { cost: 257000 },
                "혼합장": { cost: 337000 },
                "기타장류": { cost: 312000 }
            }
        },
        "조미식품": {
            "식초": {
                "발효식초": { cost: 129000 },
                "희석초산": { cost: 129000 }
            },
            "소스류": {
                "복합조미식품": { cost: 262000 },
                "마요네즈": { cost: 197000 },
                "토마토케첩": { cost: 197000 },
                "소스": { cost: 432000 }
            },
            "카레(커리)": {
                "카레(커리)분": { cost: 295000 },
                "카레(커리)": { cost: 295000 }
            },
            "고춧가루 또는 실고추": {
                "고춧가루": { cost: 480000 },
                "실고추": { cost: 180000 }
            },
            "향신료가공품": {
                "천연향신료": { cost: 364000 },
                "향신료조제품": { cost: 330000 }
            },
            "식염": {
                "천일염/제재소금/태움ㆍ용융소금/정제소금/기타소금/가공소금": { cost: 455000 }
            }
        },
        "절임류 또는 조림류": {
            "김치류": {
                "김치속": { cost: 467000 },
                "김치": { cost: 586000 }
            },
            "절임류": {
                "절임식품": { cost: 468000 },
                "당절임": { cost: 373000 }
            },
            "조림류": {
                "조림류": { cost: 337000 }
            }
        },
        "주류": {
            "탁주": {
                "탁주": { cost: 249000 }
            },
            "약주": {
                "약주:": { cost: 249000 }
            },
            "청주": {
                "청주": { cost: 94000 },
            },
            "맥주": {
                "맥주": { cost: 94000 }
            },
            "과실주": {
                "과실주(포도주)": { cost: 411000 }
            },
            "소주": {
                "소주": { cost: 109000 }
            },
            "위스키": {
                "위스키": { cost: 109000 }
            },
            "브랜디": {
                "브랜디": { cost: 109000 }
            },
            "일반증류주": {
                "일반증류주": { cost: 204000 }
            },
            "리큐르": {
                "리큐르": { cost: 94000 }
            },
            "기타주류": {
                "기타주류": { cost: 13000 }
            },
            "주정": {
                "주정": { cost: 190000 },
                "곡물주정": { cost: 136000 }
            }
        },
        "농산가공식품류": {
            "전분류": {
                "전분": { cost: 164000 },
                "전분가공품": { cost: 233000 }
            },
            "밀가루류": {
                "밀가루/영양강화밀가루": { cost: 284000 }
            },
            "땅콩 또는 견과류가공품류": {
                "땅콩버터": { cost: 216000 },
                "땅콩 또는 견과류가공품": { cost: 311000 }
            },
            "시리얼류": {
                "시리얼류": { cost: 1895000 }
            },
            "찐쌀": {
                "찐쌀": { cost: 296000 }
            },
            "효소식품": {
                "효소식품": { cost: 297000 }
            },
            "기타농산가공품류": {
                "과채가공품": { cost: 473000 },
                "곡류가공품": { cost: 1068000 },
                "두류가공품/서류가공품": { cost: 592000 },
                "기타 농산가공품": { cost: 567000 }
            }
        },
        "식육가공품 및 포장육": {
            "식육함유가공품": {
                "식육함유가공품": { cost: 383000 }
            }
        },
        "알가공품류": {
            "알함유가공품": {
                "알함유가공품": { cost: 237000 }
            }
        },
        "유가공품": {
            "유함유가공품": {
                "유함유가공품": { cost: 390000 }
            }
        },
        "수산가공식품류": {
            "어육가공품류": {
                "어육살": { cost: 197000 },
                "연육": { cost: 197000 },
                "어육반제품": { cost: 197000 },
                "어묵": { cost: 197000 },
                "어육소시지": { cost: 191000 },
                "기타 어육가공품": { cost: 197000 }
            },
            "젓갈류": {
                "젓갈": { cost: 197000 },
                "양념젓갈": { cost: 197000 },
                "액젓": { cost: 227000 },
                "조미액젓": { cost: 227000 }
            },
            "건포류": {
                "조미건어포": { cost: 444000 },
                "건어포": { cost: 191000 },
                "기타 건포류": { cost: 191000 }
            },
            "조미김": {
                "조미김": { cost: 149000 }
            },
            "한천": {
                "한천": { cost: 63000 }
            },
            "기타 수산물가공품": {
                "기타 수산물가공품": { cost: 421000 }
            }
        },
        "동물성가공식품류": {
            "기타식육 또는 기타 알제품": {
                "기타식육 또는 기타알, 기타 동물성가공식품": { cost: 564000 },
                "곤충가공식품": { cost: 288000 }
            },
            "자라가공식품": {
                "자라분말/자라분말제품": { cost: 254000 },
                "자라유제품": { cost: 327000 }
            },
            "추출가공식품": {
                "추출가공식품": { cost: 283000 }
            }
        },
        "벌꿀 및 화분가공품": {
            "벌꿀류": {
                "벌집꿀": { cost: 264000 },
                "벌꿀": { cost: 404000 },
                "사양집벌꿀": { cost: 252000 },
                "사양벌꿀": { cost: 404000 }
            },
            "로얄젤리류": {
                "로얄젤리": { cost: 214000 },
                "로얄젤리제품": { cost: 170000 }
            },
            "화분가공식품": {
                "가공화분/화분함유제품": { cost: 152000 }
            }
        },
        "즉석식품류": {
            "즉석섭취ㆍ편의식품류": {
                "신선편의식품": { cost: 791000 },
                "즉석섭취식품": { cost: 623000 },
                "즉석조리식품": { cost: 454000 },
                "간편조리세트": { cost: 594000 }
            },
            "만두류": {
                "만두": { cost: 189000 },
                "만두피": { cost: 392000 }
            }
        },
        "기타식품류": {
            "효모식품": {
                "효모식품": { cost: 80000 },
                "기타가공품": { cost: 257000 }
            }
        }
    };

    const glassTypes: GlassType[] = [
        "유리제 (비가열조리용) 포함",
        "유리제 (열탕용) 포함",
        "유리제 (전자레인지용) 포함",
        "유리제 (오븐용) 포함",
        "유리제 (직화용) 포함",
        "해당사항 없음"
    ]

    const formFields: FormField[] = [
        { id: 'productName', label: '제품명' },
        { id: 'material', label: '식품에 닿는 부분의 재질' },
        { id: 'manufacturer', label: '해외제조업소 영문명' },
        { id: 'importer', label: '수입자 업체명' },
        { id: 'address', label: '수입자 주소 (영업등록증상 주소)' },
        { id: 'contact', label: '수입자 연락처' },
        { id: 'origin', label: '원산지' }
    ]

    const categories: CategoryItem[] = [
        { id: '가공식품', label: '가공식품', description: '식품 첨가물, 건강기능식품 등' },
        { id: '기구ㆍ용기등', label: '기구ㆍ용기등', description: '식품용 기구, 용기, 포장재 등' }
    ]

    const features: FeatureItem[] = [
        { id: '한글표시사항 작성', label: '한글표시사항 작성', description: '제품의 한글 표시사항을 작성합니다' },
        { id: '검사비용 확인', label: '검사비용 확인', description: '예상되는 검사 비용을 확인합니다' }
    ]

    // 유틸리티 함수
    const getGlassMaterial = (type: GlassType): string => {
        switch (type) {
            case "유리제 (열탕용) 포함":
                return "유리제(열탕용)";
            case "유리제 (전자레인지용) 포함":
                return "유리제(전자레인지용)";
            case "유리제 (오븐용) 포함":
                return "유리제(오븐용)";
            case "유리제 (직화용) 포함":
                return "유리제(직화용)";
            default:
                return "";
        }
    }

    const getAdditionalText = (type: GlassType): string => {
        if (type === "유리제 (비가열조리용) 포함") {
            return "가열조리용으로 사용하지 마십시오"
        } else if (type && type !== "해당사항 없음") {
            return "표시된 용도 외로 사용하지 마십시오"
        }
        return ""
    }

    // 이벤트 핸들러
    const handleGlassTypeSelect = (type: GlassType): void => {
        setGlassType(type);
        if (type !== "유리제 (비가열조리용) 포함" && type !== "해당사항 없음" && type !== null) {
            const glassText = getGlassMaterial(type);
            setFormData(prev => ({
                ...prev,
                material: `${glassText}, `
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                material: ''
            }));
        }
    }

    const handleInputChange = (field: keyof FormDataType, value: string): void => {
        if (field === 'material' &&
            glassType &&
            glassType !== "유리제 (비가열조리용) 포함" &&
            glassType !== "해당사항 없음") {
            const baseGlassText = getGlassMaterial(glassType);

            if (!value.startsWith(baseGlassText)) {
                value = baseGlassText + value.slice(baseGlassText.length - 1);
            }
        }

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }

    const handleFormSubmit = (): void => {
        const isFormComplete = Object.values(formData).every(value => value.trim() !== '');

        if (!isFormComplete) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        const modifiedFormData = {
            ...formData,
            productName: `${formData.productName} (식품용)`
        };

        const additionalText = getAdditionalText(glassType);
        setResult({ ...modifiedFormData, additionalText });
        setShowTable(true);
    }

    // 여기에 새로운 함수를 추가합니다
    const handleProcessedFoodSubmit = (): void => {
        // 모든 필수 필드가 입력되었는지 확인
        const isFormComplete = [
            processedFoodForm.productName,
            processedFoodForm.foodType,
            processedFoodForm.businessInfo,
            processedFoodForm.manufacturerName,  // 올바른 필드명
            processedFoodForm.manufactureDate,
            processedFoodForm.expiryDate,
            processedFoodForm.contentAndCalories,
            processedFoodForm.ingredients,
            processedFoodForm.packagingMaterial,
            processedFoodForm.storageMethod
        ].every(field => field.trim() !== '');

        if (!isFormComplete) {
            alert("모든 필수 항목을 입력해주세요.");
            return;
        }

        // 제품명에 살균/멸균 표시 추가
        let displayProductName = processedFoodForm.productName;
        if (processedFoodForm.sterilizationType === 'sterilized') {
            displayProductName += ' (멸균제품)';
        } else if (processedFoodForm.sterilizationType === 'sanitized') {
            displayProductName += ' (살균제품)';
        }

        // 알레르기 유발물질 정보 생성
        const allergenInfo = processedFoodForm.allergens.length > 0
            ? `다음 항목을 포함: ${processedFoodForm.allergens.join(', ')}`
            : '해당사항 없음';

        // GMO 정보 생성
        const gmoInfo = processedFoodForm.gmoIngredients.length > 0
            ? `다음 GMO 원재료 포함: ${processedFoodForm.gmoIngredients.join(', ')}`
            : '해당사항 없음';

        // 결과 설정
        setResult({
            ...processedFoodForm,
            productName: displayProductName,
            allergenInfo,
            gmoInfo,
            additionalText: "부정 불량식품 신고는 국번없이 1399"
        } as ProcessedFoodResultType);
        setShowTable(true);
    };

    const handleAddMaterial = (): void => {
        setSelections(prev => [...prev, {
            id: Date.now().toString(),
            mainCategory: '',
            midCategory: '',
            subCategory: '',
            cost: 0
        }]);
    }

    const handleRemoveMaterial = (id: string): void => {
        setSelections(prev => prev.filter(item => item.id !== id));
    }

    const handleSelectionChange = (id: string, field: keyof CostSelection, value: string): void => {
        setSelections(prev => prev.map(selection => {
            if (selection.id === id) {
                const updated = { ...selection, [field]: value };

                if (category === '가공식품') {
                    // 가공식품일 경우
                    if (field === 'mainCategory') {
                        updated.midCategory = '';
                        updated.subCategory = '';
                        updated.cost = 0;
                    } else if (field === 'midCategory') {
                        updated.subCategory = '';
                        updated.cost = 0;
                    } else if (field === 'subCategory' && updated.mainCategory && updated.midCategory) {
                        updated.cost = processedFoodData[updated.mainCategory][updated.midCategory][value].cost;
                    }
                } else {
                    // 기구용기등일 경우
                    if (field === 'mainCategory') {
                        updated.midCategory = '';
                        updated.subCategory = '';
                        updated.cost = 0;
                    } else if (field === 'midCategory') {
                        updated.subCategory = '';
                        updated.cost = 0;
                    } else if (field === 'subCategory' && updated.mainCategory && updated.midCategory) {
                        updated.cost = materialsData[updated.mainCategory][updated.midCategory][value].cost;
                    }
                }
                return updated;
            }
            return selection;
        }));
    };
    // 총 비용 계산 Effect
    React.useEffect(() => {
        const total = selections.reduce((sum, selection) => sum + selection.cost, 0);
        setTotalCost(total);
    }, [selections]);

    // Step 컴포넌트
    const Step = ({ number, title, active }: StepProps): JSX.Element => (
        <div className="flex items-center gap-2 text-sm">
            <div className={`rounded-full w-6 h-6 flex items-center justify-center ${active ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}>
                {number}
            </div>
            <span className={active ? 'font-semibold' : 'text-gray-500'}>{title}</span>
        </div>
    )

    // 결과를 표시할 때 타입 가드 추가
    const isProcessedFoodResult = (result: ResultType): result is ProcessedFoodResultType => {
        return 'foodType' in result;
    };

    const basicFields = [
        { id: 'businessInfo' as ProcessedFoodStringFields, label: '영업소(장)의 명칭 및 소재지', placeholder: '수입자 명칭 및 소재지 주소를 입력하세요' },
        { id: 'manufacturerName' as ProcessedFoodStringFields, label: '해외제조업소 명칭', placeholder: '해외제조업소 영문명을 입력하세요' },
        { id: 'manufactureDate' as ProcessedFoodStringFields, label: '제조일자', placeholder: '0000.00.00 형식으로 입력하세요' },
        { id: 'expiryDate' as ProcessedFoodStringFields, label: '소비기한', placeholder: '0000.00.00 형식으로 입력하세요' },
        { id: 'contentAndCalories' as ProcessedFoodStringFields, label: '내용량 및 열량', placeholder: '제품의 중량과 열량을 입력하세요' },
        { id: 'ingredients' as ProcessedFoodStringFields, label: '원재료명', placeholder: '제품에 포함된 원재료 목록을 입력하세요' },
        { id: 'packagingMaterial' as ProcessedFoodStringFields, label: '용기ㆍ포장 재질', placeholder: '포장재 종류를 입력하세요' },
        { id: 'storageMethod' as ProcessedFoodStringFields, label: '보관방법', placeholder: '보관 조건을 입력하세요' },
    ];

    return (
        <div className="max-w-3xl mx-auto mt-8 p-8 bg-white shadow-lg rounded-xl">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">수입식품 검사 서비스</h2>

            {/* Progress Steps */}
            <div className="flex justify-between mb-8 px-4">
                <Step number="1" title="검사 유형 선택" active={!category} />
                <Step number="2" title="기능 선택" active={Boolean(category && !feature)} />
                <Step number="3" title="정보 입력" active={Boolean(category && feature)} />
            </div>

            {/* Category Selection */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">검사 유형을 선택하세요:</h3>
                <div className="flex flex-row gap-4 w-full">
                    {categories.map((item) => (
                        <Card
                            key={item.id}
                            className={`cursor-pointer transition-all hover:shadow-md flex-1 ${category === item.id ? 'ring-2 ring-blue-500' : ''
                                }`}
                            onClick={() => {
                                if (category === item.id) {
                                    setCategory(null)
                                    setFeature(null)
                                    setFormData({
                                        productName: '',
                                        material: '',
                                        manufacturer: '',
                                        importer: '',
                                        address: '',
                                        contact: '',
                                        origin: ''
                                    })
                                    setShowTable(false)
                                    setSelections([{
                                        id: '1',
                                        mainCategory: '',
                                        midCategory: '',
                                        subCategory: '',
                                        cost: 0
                                    }])
                                } else {
                                    setCategory(item.id)
                                    setFormData({
                                        productName: '',
                                        material: '',
                                        manufacturer: '',
                                        importer: '',
                                        address: '',
                                        contact: '',
                                        origin: ''
                                    })
                                    setShowTable(false)
                                }
                            }}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold">{item.label}</h4>
                                        <p className="text-sm text-gray-500">{item.description}</p>
                                    </div>
                                    {category === item.id && <CheckCircle2 className="text-blue-500" />}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Feature Selection */}
            {category && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">이용할 기능을 선택하세요:</h3>
                    <div className="flex flex-row gap-4 w-full">
                        {features.map((item) => (
                            <Card
                                key={item.id}
                                className={`cursor-pointer transition-all hover:shadow-md flex-1 ${feature === item.id ? 'ring-2 ring-blue-500' : ''
                                    }`}
                                onClick={() => {
                                    if (feature === item.id) {
                                        setFeature(null)
                                    } else {
                                        setFeature(item.id)
                                        setShowTable(false)
                                    }
                                }}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold">{item.label}</h4>
                                            <p className="text-sm text-gray-500">{item.description}</p>
                                        </div>
                                        {feature === item.id && <CheckCircle2 className="text-blue-500" />}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Forms */}
            {feature && (
                <div className="mb-8">
                    {/* 가공식품 - 한글표시사항 작성 */}
                    {category === '가공식품' && feature === '한글표시사항 작성' ? (
                        <>
                            <div className="space-y-6">
                                {/* Step 1: 기본 정보 입력 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">기본 정보</h3>
                                    <div className="grid gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                제품명
                                            </label>
                                            <Input
                                                className="w-full p-3"
                                                value={processedFoodForm.productName}
                                                onChange={(e) => setProcessedFoodForm(prev => ({
                                                    ...prev,
                                                    productName: e.target.value
                                                }))}
                                                placeholder="수출국 표시사항과 동일한 제품명을 입력하세요"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                식품유형
                                            </label>
                                            <Select
                                                value={processedFoodForm.foodType}
                                                onValueChange={(value) => setProcessedFoodForm(prev => ({
                                                    ...prev,
                                                    foodType: value
                                                }))}
                                            >
                                                <SelectTrigger className="w-full p-3">
                                                    <SelectValue placeholder="식품유형을 선택하세요" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(processedFoodData).flatMap(([, mainCat]) =>
                                                        Object.entries(mainCat).flatMap(([, midCat]) =>
                                                            Object.keys(midCat).map(subCat => (
                                                                <SelectItem key={subCat} value={subCat}>
                                                                    {subCat}
                                                                </SelectItem>
                                                            ))
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* 나머지 기본 입력 필드들 */}
                                        {basicFields.map(field => (
                                            <div key={field.id}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {field.label}
                                                </label>
                                                <Input
                                                    className="w-full p-3"
                                                    value={
                                                        typeof processedFoodForm[field.id] === 'string' 
                                                            ? processedFoodForm[field.id] as string 
                                                            : typeof processedFoodForm[field.id] === 'number'
                                                                ? processedFoodForm[field.id].toString()
                                                                : ''
                                                    }
                                                    onChange={(e) => setProcessedFoodForm(prev => ({
                                                        ...prev,
                                                        [field.id]: e.target.value
                                                    }))}
                                                    placeholder={field.placeholder}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Step 2: 알레르기 유발물질 체크 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">알레르기 유발물질 함유 여부</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {ALLERGENS.map(allergen => (
                                            <label key={allergen} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={processedFoodForm.allergens.includes(allergen)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setProcessedFoodForm(prev => ({
                                                                ...prev,
                                                                allergens: [...prev.allergens, allergen]
                                                            }))
                                                        } else {
                                                            setProcessedFoodForm(prev => ({
                                                                ...prev,
                                                                allergens: prev.allergens.filter(a => a !== allergen)
                                                            }))
                                                        }
                                                    }}
                                                    className="form-checkbox"
                                                />
                                                <span className="text-sm">{allergen}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Step 3: GMO 표시대상 체크 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">유전자변형식품 표시대상 여부</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {GMO_INGREDIENTS.map(ingredient => (
                                            <label key={ingredient} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={processedFoodForm.gmoIngredients.includes(ingredient)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setProcessedFoodForm(prev => ({
                                                                ...prev,
                                                                gmoIngredients: [...prev.gmoIngredients, ingredient]
                                                            }))
                                                        } else {
                                                            setProcessedFoodForm(prev => ({
                                                                ...prev,
                                                                gmoIngredients: prev.gmoIngredients.filter(i => i !== ingredient)
                                                            }))
                                                        }
                                                    }}
                                                    className="form-checkbox"
                                                />
                                                <span className="text-sm">{ingredient}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Step 4: 살균/멸균 여부 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">살균/멸균 여부</h3>
                                    <Select
                                        value={processedFoodForm.sterilizationType}
                                        onValueChange={(value) => setProcessedFoodForm(prev => ({
                                            ...prev,
                                            sterilizationType: value as 'none' | 'sterilized' | 'sanitized'
                                        }))}
                                    >
                                        <SelectTrigger className="w-full p-3">
                                            <SelectValue placeholder="살균/멸균 여부를 선택하세요" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STERILIZATION_TYPES.map(type => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Step 5: 영양성분 표시 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">영양성분 표시대상 여부</h3>
                                    <div className="flex items-center space-x-4 mb-4">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                checked={processedFoodForm.nutritionLabeling.required}
                                                onChange={() => setProcessedFoodForm(prev => ({
                                                    ...prev,
                                                    nutritionLabeling: {
                                                        required: true,
                                                        values: prev.nutritionLabeling.values
                                                    }
                                                }))}
                                                className="form-radio"
                                            />
                                            <span>예</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                checked={!processedFoodForm.nutritionLabeling.required}
                                                onChange={() => setProcessedFoodForm(prev => ({
                                                    ...prev,
                                                    nutritionLabeling: {
                                                        required: false,
                                                        values: prev.nutritionLabeling.values
                                                    }
                                                }))}
                                                className="form-radio"
                                            />
                                            <span>아니오</span>
                                        </label>
                                    </div>

                                    {processedFoodForm.nutritionLabeling.required && (
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { id: 'calories' as NutrientId, label: '열량', unit: 'kcal' },
                                                { id: 'sodium' as NutrientId, label: '나트륨', unit: 'mg' },
                                                { id: 'carbohydrate' as NutrientId, label: '탄수화물', unit: 'g' },
                                                { id: 'sugars' as NutrientId, label: '당류', unit: 'g' },
                                                { id: 'fat' as NutrientId, label: '지방', unit: 'g' },
                                                { id: 'transFat' as NutrientId, label: '트랜스지방', unit: 'g' },
                                                { id: 'saturatedFat' as NutrientId, label: '포화지방', unit: 'g' },
                                                { id: 'cholesterol' as NutrientId, label: '콜레스테롤', unit: 'mg' },
                                                { id: 'protein' as NutrientId, label: '단백질', unit: 'g' }
                                            ].map(nutrient => (
                                                <div key={nutrient.id}>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        {nutrient.label} ({nutrient.unit})
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        className="w-full p-3"
                                                        value={processedFoodForm.nutritionLabeling.values[nutrient.id].toString()}
                                                        onChange={(e) => setProcessedFoodForm(prev => ({
                                                            ...prev,
                                                            nutritionLabeling: {
                                                                ...prev.nutritionLabeling,
                                                                values: {
                                                                    ...prev.nutritionLabeling.values,
                                                                    [nutrient.id]: parseFloat(e.target.value) || 0
                                                                }
                                                            }
                                                        }))}
                                                        placeholder={`${nutrient.label}을(를) 입력하세요`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Button
                                    onClick={handleProcessedFoodSubmit}
                                    className="w-full py-6 text-lg bg-blue-500 hover:bg-blue-600"
                                >
                                    결과 확인
                                </Button>
                            </div>
                        </>
                    ) : category === '가공식품' && feature === '검사비용 확인' ? (
                        <div className="space-y-6">
                            {selections.map((selection, index) => (
                                <Card key={selection.id} className="p-4">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold">식품유형 {index + 1}</h3>
                                            {selections.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleRemoveMaterial(selection.id)}
                                                >
                                                    <Trash2 className="h-5 w-5 text-red-500" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <Select
                                                value={selection.mainCategory}
                                                onValueChange={(value) => handleSelectionChange(selection.id, 'mainCategory', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="대분류 선택" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.keys(processedFoodData).map(category => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Select
                                                value={selection.midCategory}
                                                onValueChange={(value) => handleSelectionChange(selection.id, 'midCategory', value)}
                                                disabled={!selection.mainCategory}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="중분류 선택" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {selection.mainCategory &&
                                                        Object.keys(processedFoodData[selection.mainCategory]).map(category => (
                                                            <SelectItem key={category} value={category}>
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>

                                            <Select
                                                value={selection.subCategory}
                                                onValueChange={(value) => handleSelectionChange(selection.id, 'subCategory', value)}
                                                disabled={!selection.midCategory}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="소분류 선택" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {selection.mainCategory && selection.midCategory &&
                                                        Object.keys(processedFoodData[selection.mainCategory][selection.midCategory]).map(category => (
                                                            <SelectItem key={category} value={category}>
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {selection.cost > 0 && (
                                            <div className="text-right text-sm text-gray-600">
                                                예상 비용: {selection.cost.toLocaleString()}원
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}

                            <Button
                                onClick={handleAddMaterial}
                                variant="outline"
                                className="w-full"
                            >
                                <PlusCircle className="h-5 w-5 mr-2" />
                                식품유형 추가
                            </Button>

                            {totalCost > 0 && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="text-lg font-semibold">
                                        총 예상 비용: {totalCost.toLocaleString()}원
                                    </div>
                                    <div className="text-sm text-gray-500 mt-2">
                                        * 포함된 원재료 또는 제조공정에 따라 검사항목이 추가되거나 삭제될 수 있으므로 검사 비용은 달라질 수 있으니 예상 비용으로만 참고하시기 바랍니다&quot;
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : category === '기구ㆍ용기등' && feature === '한글표시사항 작성' ? (
                        <>
                            {!glassType ? (
                                <>
                                    <h3 className="text-lg font-semibold mb-4">유리제 포함 여부 선택:</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {glassTypes.map((type) => (
                                            <Card
                                                key={type}
                                                className={`cursor-pointer transition-all hover:shadow-md ${glassType === type ? 'ring-2 ring-blue-500' : ''
                                                    }`}
                                                onClick={() => handleGlassTypeSelect(type)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-semibold">{type}</h4>
                                                        </div>
                                                        {glassType === type && <CheckCircle2 className="text-blue-500" />}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-lg font-semibold mb-4">상세 정보 입력:</h3>
                                    <div className="space-y-4">
                                        {formFields.map((field) => (
                                            <div key={field.id}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {field.label}
                                                </label>
                                                <Input
                                                    key={field.id}
                                                    className="w-full p-3"
                                                    value={formData[field.id]}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    placeholder={field.id === 'material'
                                                        ? "정확한 재질을 입력하세요 EX) 폴리프로필렌 또는 PP 등"
                                                        : `${field.label}을(를) 입력하세요`}
                                                />
                                            </div>
                                        ))}
                                        <Button
                                            onClick={handleFormSubmit}
                                            className="w-full py-6 text-lg bg-blue-500 hover:bg-blue-600"
                                        >
                                            결과 확인
                                        </Button>
                                    </div>
                                </>
                            )}
                        </>
                    ) : category === '기구ㆍ용기등' && feature === '검사비용 확인' ? (
                        <div className="space-y-6">
                            {selections.map((selection, index) => (
                                <Card key={selection.id} className="p-4">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold">재질 {index + 1}</h3>
                                            {selections.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleRemoveMaterial(selection.id)}
                                                >
                                                    <Trash2 className="h-5 w-5 text-red-500" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <Select
                                                value={selection.mainCategory}
                                                onValueChange={(value) => handleSelectionChange(selection.id, 'mainCategory', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="대분류 선택" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.keys(materialsData).map(category => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Select
                                                value={selection.midCategory}
                                                onValueChange={(value) => handleSelectionChange(selection.id, 'midCategory', value)}
                                                disabled={!selection.mainCategory}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="중분류 선택" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {selection.mainCategory &&
                                                        Object.keys(materialsData[selection.mainCategory]).map(category => (
                                                            <SelectItem key={category} value={category}>
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>

                                            <Select
                                                value={selection.subCategory}
                                                onValueChange={(value) => handleSelectionChange(selection.id, 'subCategory', value)}
                                                disabled={!selection.midCategory}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="소분류 선택" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {selection.mainCategory && selection.midCategory &&
                                                        Object.keys(materialsData[selection.mainCategory][selection.midCategory]).map(category => (
                                                            <SelectItem key={category} value={category}>
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {selection.cost > 0 && (
                                            <div className="text-right text-sm text-gray-600">
                                                예상 비용: {selection.cost.toLocaleString()}원
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}

                            <Button
                                onClick={handleAddMaterial}
                                variant="outline"
                                className="w-full"
                            >
                                <PlusCircle className="h-5 w-5 mr-2" />
                                재질 추가
                            </Button>

                            {totalCost > 0 && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="text-lg font-semibold">
                                        총 예상 비용: {totalCost.toLocaleString()}원
                                    </div>
                                    <div className="text-sm text-gray-500 mt-2">
                                        * 해당 비용은 예상비용으로서 실제 발생 비용은 달라질 수 있습니다.
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}

            {/* Result Table for Processed Food */}
            {showTable && result && feature === '한글표시사항 작성' && category === '가공식품' && (
                <div className="mt-8">
                    <table className="w-full border-collapse border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th colSpan={2} className="text-center p-4 border-b font-bold">
                                    식품위생법에 따른 한글표시사항
                                </th>
                            </tr>
                            <tr>
                                <th className="text-left p-4 border-b w-1/3">항목</th>
                                <th className="text-left p-4 border-b">내용</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-4 border-b font-medium">제품명</td>
                                <td className="p-4 border-b">{result.productName}</td>
                            </tr>
                            {isProcessedFoodResult(result) && (
                                <tr>
                                    <td className="p-4 border-b font-medium">식품유형</td>
                                    <td className="p-4 border-b">{result.foodType}</td>
                                </tr>
                            )}
                            {isProcessedFoodResult(result) && (  // 타입 가드 추가
                                <tr>
                                    <td className="p-4 border-b font-medium">영업소(장)의 명칭 및 소재지</td>
                                    <td className="p-4 border-b">{result.businessInfo}</td>
                                </tr>
                            )}
                            <tr>
                                <td className="p-4 border-b font-medium">해외제조업소 명칭</td>
                                <td className="p-4 border-b">
                                    {isProcessedFoodResult(result) ? result.manufacturerName : result.manufacturer}
                                </td>
                            </tr>
                            {isProcessedFoodResult(result) && (
                                <tr>
                                    <td className="p-4 border-b font-medium">제조일자</td>
                                    <td className="p-4 border-b">{result.manufactureDate}</td>
                                </tr>
                            )}
                            {isProcessedFoodResult(result) && (
                                <tr>
                                    <td className="p-4 border-b font-medium">소비기한</td>
                                    <td className="p-4 border-b">{result.expiryDate}</td>
                                </tr>
                            )}
                            {isProcessedFoodResult(result) && (
                                <tr>
                                    <td className="p-4 border-b font-medium">내용량 및 열량</td>
                                    <td className="p-4 border-b">{result.contentAndCalories}</td>
                                </tr>
                            )}
                            {isProcessedFoodResult(result) && (
                                <tr>
                                    <td className="p-4 border-b font-medium">원재료명</td>
                                    <td className="p-4 border-b">{result.ingredients}</td>
                                </tr>
                            )}
                            {isProcessedFoodResult(result) && (
                                <tr>
                                    <td className="p-4 border-b font-medium">알레르기 유발물질</td>
                                    <td className="p-4 border-b">{result.allergenInfo}</td>
                                </tr>
                            )}
                            {isProcessedFoodResult(result) && (
                                <tr>
                                    <td className="p-4 border-b font-medium">유전자변형식품</td>
                                    <td className="p-4 border-b">{result.gmoInfo}</td>
                                </tr>
                            )}
                            {isProcessedFoodResult(result) && result.nutritionLabeling && result.nutritionLabeling.required && (
                                <tr>
                                    <td className="p-4 border-b font-medium">영양성분</td>
                                    <td className="p-4 border-b">
                                        <div>열량: {result.nutritionLabeling.values.calories}kcal</div>
                                        <div>나트륨: {result.nutritionLabeling.values.sodium}mg</div>
                                        <div>탄수화물: {result.nutritionLabeling.values.carbohydrate}g</div>
                                        <div>당류: {result.nutritionLabeling.values.sugars}g</div>
                                        <div>지방: {result.nutritionLabeling.values.fat}g</div>
                                        <div>트랜스지방: {result.nutritionLabeling.values.transFat}g</div>
                                        <div>포화지방: {result.nutritionLabeling.values.saturatedFat}g</div>
                                        <div>콜레스테롤: {result.nutritionLabeling.values.cholesterol}mg</div>
                                        <div>단백질: {result.nutritionLabeling.values.protein}g</div>
                                    </td>
                                </tr>
                            )}
                            {isProcessedFoodResult(result) && (
                                <tr>
                                    <td className="p-4 border-b font-medium">용기ㆍ포장 재질</td>
                                    <td className="p-4 border-b">{result.packagingMaterial}</td>
                                </tr>
                            )}
                            {isProcessedFoodResult(result) && (
                                <tr>
                                    <td className="p-4 border-b font-medium">보관방법</td>
                                    <td className="p-4 border-b">{result.storageMethod}</td>
                                </tr>
                            )}
                            <tr>
                                <td className="p-4 border-b font-medium">추가 안내사항</td>
                                <td className="p-4 border-b text-red-500">{result.additionalText}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Result Table */}
            {showTable && result && feature === '한글표시사항 작성' && category === '기구ㆍ용기등' && (
                <div className="mt-8">
                    <table className="w-full border-collapse border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th colSpan={2} className="text-center p-4 border-b font-bold">
                                    식품위생법에 따른 한글표시사항
                                </th>
                            </tr>
                            <tr>
                                <th className="text-left p-4 border-b w-1/3">항목</th>
                                <th className="text-left p-4 border-b">내용</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-4 border-b font-medium">제품명</td>
                                <td className="p-4 border-b">{result.productName}</td>
                            </tr>
                            <tr>
                                <td className="p-4 border-b font-medium">식품에 닿는 부분의 재질</td>
                                <td className="p-4 border-b">{result.material}</td>
                            </tr>
                            <tr>
                                <td className="p-4 border-b font-medium">해외제조업소 영문명</td>
                                <td className="p-4 border-b">{result.manufacturer}</td>
                            </tr>
                            <tr>
                                <td className="p-4 border-b font-medium">수입자 업체명</td>
                                <td className="p-4 border-b">{result.importer}</td>
                            </tr>
                            <tr>
                                <td className="p-4 border-b font-medium">수입자 주소</td>
                                <td className="p-4 border-b">{result.address}</td>
                            </tr>
                            <tr>
                                <td className="p-4 border-b font-medium">수입자 연락처</td>
                                <td className="p-4 border-b">{result.contact}</td>
                            </tr>
                            <tr>
                                <td className="p-4 border-b font-medium">원산지</td>
                                <td className="p-4 border-b">{result.origin}</td>
                            </tr>
                            {result.additionalText && (
                                <tr>
                                    <td className="p-4 border-b font-medium">추가 안내사항</td>
                                    <td className="p-4 border-b text-red-500 font-semibold">{result.additionalText}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}          