// app/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">개인정보처리방침</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">제1조 (개인정보의 처리목적)</h2>
          <div className="space-y-4 text-gray-600">
            <p>&ldquo;포켓커스텀&rdquo;(이하 &ldquo;회사&rdquo;)은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
            
            <div className="ml-4 space-y-2">
              <p>1. 회원 가입 및 관리</p>
              <ul className="list-disc ml-8">
                <li>회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별・인증</li>
                <li>회원자격 유지・관리, 서비스 부정이용 방지, 각종 고지・통지</li>
                <li>분쟁 조정을 위한 기록 보존, 민원처리 등 회원관리</li>
              </ul>

              <p>2. 재화 또는 서비스 제공</p>
              <ul className="list-disc ml-8">
                <li>서비스 제공, 콘텐츠 제공, 맞춤서비스 제공</li>
                <li>본인인증, 요금결제・정산</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">제2조 (개인정보의 처리 및 보유기간)</h2>
          <div className="space-y-4 text-gray-600">
            <p>① 회사는 법령에 따른 개인정보 보유・이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유・이용기간 내에서 개인정보를 처리・보유합니다.</p>
            
            <p>② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.</p>
            <div className="ml-4 space-y-2">
              <p>1. 회원 가입 및 관리: 회원 탈퇴 시까지</p>
              <ul className="list-disc ml-8">
                <li>다만, 다음의 사유에 해당하는 경우에는 해당 사유 종료 시까지</li>
                <li>관계 법령 위반에 따른 수사・조사 등이 진행 중인 경우</li>
                <li>서비스 이용에 따른 채권・채무관계 잔존 시</li>
              </ul>

              <p>2. 재화 또는 서비스 제공: 서비스 공급완료 및 요금결제・정산 완료시까지</p>
              <ul className="list-disc ml-8">
                <li>다만, 관련 법령에 따라 일정 기간 보관해야 하는 경우 해당 기간까지</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">제3조 (처리하는 개인정보의 항목)</h2>
          <div className="space-y-4 text-gray-600">
            <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
            
            <div className="ml-4 space-y-2">
              <p>1. 회원 가입 및 관리</p>
              <ul className="list-disc ml-8">
                <li>필수항목: 이름, 생년월일, 아이디, 비밀번호, 연락처, 이메일</li>
                <li>선택항목: 관심분야, 마케팅 수신 동의</li>
              </ul>

              <p>2. 서비스 이용 과정에서 자동으로 생성되어 수집되는 정보</p>
              <ul className="list-disc ml-8">
                <li>IP주소, 쿠키, 서비스 이용기록, 방문기록 등</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">제4조 (개인정보의 제3자 제공)</h2>
          <div className="space-y-4 text-gray-600">
            <p>① 회사는 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
            
            <p>② 회사는 다음과 같이 개인정보를 제3자에게 제공하고 있습니다.</p>
            <div className="ml-4">
              <ul className="list-disc ml-8">
                <li>개인정보를 제공받는 자: 결제대행사</li>
                <li>제공받는 자의 개인정보 이용목적: 결제 서비스 제공</li>
                <li>제공하는 개인정보 항목: 이름, 연락처, 결제정보</li>
                <li>제공받는 자의 보유・이용기간: 결제 서비스 제공 완료 시까지</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">제5조 (정보주체와 법정대리인의 권리・의무 및 행사방법)</h2>
          <div className="space-y-4 text-gray-600">
            <p>① 정보주체는 회사에 대해 언제든지 개인정보 열람・정정・삭제・처리정지 요구 등의 권리를 행사할 수 있습니다.</p>
            
            <p>② 제1항에 따른 권리 행사는 회사에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체없이 조치하겠습니다.</p>
            
            <p>③ 제1항에 따른 권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다. 이 경우 &ldquo;개인정보 처리 방법에 관한 고시&rdquo;별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">제6조 (개인정보의 안전성 확보조치)</h2>
          <div className="space-y-4 text-gray-600">
            <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            
            <ol className="list-decimal ml-8 space-y-2">
              <li>관리적 조치: 내부관리계획 수립・시행, 정기적 직원 교육</li>
              <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
              <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
            </ol>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">제7조 (개인정보 보호책임자)</h2>
          <div className="space-y-4 text-gray-600">
            <p>① 회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
            
            <div className="ml-4">
              <p>▶ 개인정보 보호책임자</p>
              <ul className="list-disc ml-8">
                <li>성명: 홍길동</li>
                <li>직책: 개인정보 보호책임자</li>
                <li>연락처: privacy@company.com</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="text-gray-600 mt-8">
          <p>부칙</p>
          <p>이 개인정보처리방침은 2024년 2월 24일부터 적용됩니다.</p>
        </div>
      </div>
    </div>
  );
}