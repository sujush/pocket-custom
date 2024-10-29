import pandas as pd

# 샘플 데이터
data = {
    'RawData': [
        '"""346"" ""Furniture""  HsCode""940360""> 가구/조명> 가구',
        '"""1555"" ""fittings for furniture""  HsCode""3926300000""> 가구/조명> 가구 부착구 (플라스틱)',
        '"""347"" ""furniture parts""  HsCode""9403990000""> 가구/조명> 가구부품',
        '"""646"" ""Drying Rack""  HsCode""732690""> 가구/조명> 건조대',
        '"""647"" ""painting""  HsCode""970199""> 가구/조명> 그림',
        '"""648"" ""flag""  HsCode""630790""> 가구/조명> 깃발'
    ]
}

# 데이터프레임 생성
df = pd.DataFrame(data)

# 정규표현식을 사용하여 필요한 정보 추출
df[['대분류', '소분류', 'HsCode']] = df['RawData'].str.extract(r'HsCode""(\d+)""> (.+?)> (.+)')

# 필요한 열만 남기고 기존 RawData 열 삭제
df_final = df[['대분류', '소분류', 'HsCode']]

# 엑셀 파일로 저장
output_file = '/mnt/data/processed_data.xlsx'
df_final.to_excel(output_file, index=False, header=False)

print("데이터가 가공되어 엑셀 파일로 저장되었습니다:", output_file)
