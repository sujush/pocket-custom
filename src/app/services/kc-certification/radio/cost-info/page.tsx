export default function RadioCostInfoPage() {
    return (
      <div className="p-8">
        <h2 className="text-2xl mb-4 font-bold">검사비용 확인</h2>
        <p>
          전파인증 검사비용은 인증 대상 기자재의 종류, 적용 규격 등에 따라 다릅니다.
          예) 무선데이터통신기기, 무선마이크, RFID기기... 
          <br />
          자세한 내용은 <a href="http://www.rra.go.kr" className="text-blue-600 underline">국립전파연구원</a> 등의 공식 페이지를 참고하세요.
        </p>
        {/* 필요하다면 표나 추가 정보를 넣으세요 */}
      </div>
    );
  }
  