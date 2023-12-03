import React from "react";

import MaxWidthWrapper from "~/app/_components/max-width-wrapper";

export default function Onboarding() {
  return (
    <MaxWidthWrapper>
      <div className="flex items-center justify-center">
        <div className="w-1/2">
          <h1 className="text-center text-3xl font-bold">
            Добро пожаловать в Kodix Care!
          </h1>
          <div className="mt-4 text-center">
            <p>
              Ваша заявка отправлена на рассмотрение. В ближайшее время мы
              свяжемся с вами.
            </p>
            <p className="mt-4">
              Если у вас возникли вопросы, вы можете связаться с нами по
              телефону: <a href="tel:+74951234567">+7 (495) 123-45-67</a>
            </p>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
