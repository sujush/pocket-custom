// app/terms/page.tsx
export default function TermsPage() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">이용약관</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">제1장 총칙</h2>
          
          <div className="space-y-4">
            <article>
              <h3 className="font-medium mb-2">제1조 (목적)</h3>
              <p className="text-gray-600">
                이 약관은 [서비스명] (이하 "회사"라 합니다)가 제공하는 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
              </p>
            </article>

            <article>
              <h3 className="font-medium mb-2">제2조 (용어의 정의)</h3>
              <div className="text-gray-600 space-y-2">
                <p>이 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>"서비스"란 회사가 제공하는 모든 서비스를 의미합니다.</li>
                  <li>"회원"이란 회사와 서비스 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 개인 또는 법인을 말합니다.</li>
                  <li>"아이디(ID)"란 회원의 식별과 회원의 서비스 이용을 위하여 회원이 선정하고 회사가 승인하는 문자와 숫자의 조합을 말합니다.</li>
                  <li>"비밀번호"란 회원이 부여 받은 아이디와 일치된 회원임을 확인하고 회원의 개인정보를 보호하기 위해 회원 자신이 정한 문자와 숫자의 조합을 말합니다.</li>
                </ol>
              </div>
            </article>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">제2장 서비스 이용계약</h2>
          
          <div className="space-y-4">
            <article>
              <h3 className="font-medium mb-2">제3조 (이용계약의 성립)</h3>
              <p className="text-gray-600">
                이용계약은 회원이 되고자 하는 자가 약관의 내용에 대하여 동의를 한 다음 회원가입신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.
              </p>
            </article>

            <article>
              <h3 className="font-medium mb-2">제4조 (이용신청)</h3>
              <p className="text-gray-600">
                이용신청은 온라인으로 회사 소정의 가입신청 양식에서 요구하는 사항을 기록하여 신청합니다.
              </p>
            </article>

            <article>
              <h3 className="font-medium mb-2">제5조 (이용신청의 승낙과 제한)</h3>
              <div className="text-gray-600 space-y-2">
                <p>회사는 다음 각 호에 해당하는 이용신청에 대하여는 승낙을 하지 않을 수 있습니다:</p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>기술상 서비스 제공이 불가능한 경우</li>
                  <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                  <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
                  <li>이용자의 귀책사유로 인하여 승인이 불가능하거나 기타 규정한 제반 사항을 위반하며 신청하는 경우</li>
                </ol>
              </div>
            </article>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">제3장 계약당사자의 의무</h2>
          
          <div className="space-y-4">
            <article>
              <h3 className="font-medium mb-2">제6조 (회사의 의무)</h3>
              <div className="text-gray-600 space-y-2">
                <ol className="list-decimal ml-5 space-y-1">
                  <li>회사는 관련법과 이 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 계속적이고 안정적으로 서비스를 제공하기 위하여 최선을 다하여 노력합니다.</li>
                  <li>회사는 회원이 안전하게 서비스를 이용할 수 있도록 개인정보(신용정보 포함)보호를 위해 보안시스템을 갖추어야 하며 개인정보처리방침을 공시하고 준수합니다.</li>
                </ol>
              </div>
            </article>

            <article>
              <h3 className="font-medium mb-2">제7조 (회원의 의무)</h3>
              <div className="text-gray-600 space-y-2">
                <ol className="list-decimal ml-5 space-y-1">
                  <li>회원은 관계법령, 이 약관의 규정, 이용안내 및 주의사항 등 회사가 통지하는 사항을 준수하여야 하며, 기타 회사의 업무에 방해되는 행위를 하여서는 안 됩니다.</li>
                  <li>회원은 서비스 이용과 관련하여 다음 각 호의 행위를 하여서는 안 됩니다:
                    <ul className="list-disc ml-5 mt-1">
                      <li>다른 회원의 아이디를 부정 사용하는 행위</li>
                      <li>범죄행위를 목적으로 하거나 기타 범죄행위와 관련된 행위</li>
                      <li>타인의 지적재산권을 침해하는 행위</li>
                      <li>회사의 서비스 정보를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복제 또는 유통시키거나 상업적으로 이용하는 행위</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </article>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">제4장 서비스 이용</h2>
          
          <div className="space-y-4">
            <article>
              <h3 className="font-medium mb-2">제8조 (서비스 이용시간)</h3>
              <p className="text-gray-600">
                서비스 이용시간은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간을 원칙으로 합니다. 다만, 회사는 서비스를 일정범위로 분할하여 각 범위별로 이용가능시간을 별도로 정할 수 있으며, 이 경우 그 내용을 사전에 공지합니다.
              </p>
            </article>

            <article>
              <h3 className="font-medium mb-2">제9조 (서비스 제공의 중지)</h3>
              <p className="text-gray-600">
                회사는 다음 각 호에 해당하는 경우 서비스 제공의 전부 또는 일부를 제한하거나 중지할 수 있습니다:
              </p>
              <ol className="list-decimal ml-5 space-y-1 text-gray-600 mt-2">
                <li>서비스용 설비의 보수 등 공사로 인한 부득이한 경우</li>
                <li>전기통신사업법에 규정된 기간통신사업자가 전기통신서비스를 중지했을 경우</li>
                <li>기타 불가항력적 사유가 있는 경우</li>
              </ol>
            </article>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">제5장 계약해지 및 이용제한</h2>
          
          <div className="space-y-4">
            <article>
              <h3 className="font-medium mb-2">제10조 (계약해지 및 이용제한)</h3>
              <div className="text-gray-600 space-y-2">
                <p>회원이 이용계약을 해지하고자 하는 때에는 회원 본인이 온라인을 통해 회사에 해지신청을 하여야 합니다.</p>
                <p>회사는 회원이 다음 각 호에 해당하는 행위를 하였을 경우 사전통지 없이 이용계약을 해지하거나 또는 기간을 정하여 서비스 이용을 중지할 수 있습니다:</p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>타인의 서비스 ID 및 비밀번호를 도용한 경우</li>
                  <li>서비스 운영을 고의로 방해한 경우</li>
                  <li>가입한 이름이 실명이 아닌 경우</li>
                  <li>같은 사용자가 다른 ID로 이중등록을 한 경우</li>
                  <li>공공질서 및 미풍양속에 반하는 경우</li>
                </ol>
              </div>
            </article>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">제6장 기타</h2>
          
          <div className="space-y-4">
            <article>
              <h3 className="font-medium mb-2">제11조 (분쟁해결)</h3>
              <p className="text-gray-600">
                회사와 회원은 서비스와 관련하여 발생한 분쟁을 원만하게 해결하기 위하여 필요한 모든 노력을 하여야 합니다.
              </p>
            </article>

            <article>
              <h3 className="font-medium mb-2">제12조 (재판권 및 준거법)</h3>
              <p className="text-gray-600">
                이 약관에 명시되지 않은 사항은 전기통신사업법 등 관계법령과 상관례에 따릅니다. 회사의 유료서비스 이용약관 등 회사가 정한 정책 또는 규정도 이용약관의 일부를 구성합니다.
              </p>
            </article>
          </div>
        </section>

        <div className="text-gray-600 mt-8">
          <p>부칙</p>
          <p>이 약관은 2024년 2월 24일부터 시행합니다.</p>
        </div>
      </div>
    </div>
  );
}
