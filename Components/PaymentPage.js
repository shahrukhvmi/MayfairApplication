import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PaymentPage = ({ paymentData }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!paymentData?.actionurl) return;

    const updateCountdown = () => {
      setCountdown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("p_id");
          document.getElementById("process-payment-form").submit();
          return 0;
        }
        setTimeout(updateCountdown, 1000);
        return prev - 1;
      });
    };

    const timer = setTimeout(updateCountdown, 1000);
    return () => clearTimeout(timer);
  }, [paymentData]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center flex flex-col items-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Loader ring */}
          <svg className="w-16 h-16 text-violet-600 animate-spin mb-6" viewBox="0 0 50 50">
            <circle className="opacity-25" cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5" />
            <circle
              className="opacity-100 text-violet-500"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeDasharray="90"
              strokeDashoffset="0"
              strokeLinecap="round"
            />
          </svg>

          {/* Text */}
          <p className="text-xl bold-font text-gray-800">Please wait</p>
          <p className="bold-font text-base text-gray-600 mt-2">Redirecting in {countdown}...</p>

          <hr className="w-full my-6 border-gray-200" />

          <p className="reg-font text-sm text-gray-500">Do not leave this page, you will be redirected to payment promptly.</p>
        </motion.div>

        {/* Hidden form */}
        <form style={{ display: "none" }} id="process-payment-form" method="post" action={paymentData.actionurl}>
          <fieldset>
            <legend>IPG Connect Request Details</legend>
            <p>
              <label>Biling Information:</label>
              <input type="hidden" name="bname" value={paymentData.bname} readOnly />
              <input type="hidden" name="baddr1" value={paymentData.baddr1} readOnly />
              <input type="hidden" name="baddr2" value={paymentData.baddr2} readOnly />
              <input type="hidden" name="bcity" value={paymentData.bcity} readOnly />
              <input type="hidden" name="bstate" value={paymentData.bstate} readOnly />
              <input type="hidden" name="bcountry" value={paymentData.bcountry} readOnly />
              <input type="hidden" name="bzip" value={paymentData.bzip} readOnly />
              <input type="hidden" name="phone" value={paymentData.phone} readOnly />
              <input type="hidden" name="email" value={paymentData.email} readOnly />
            </p>
            <p>
              <label htmlFor="oid">Order ID:</label>
              <input type="hidden" name="oid" value={paymentData.oid} readOnly />
            </p>
            {/* <p>
              <label htmlFor="companyId">Company ID:</label>
              <input type="hidden" name="companyId" value={1} readOnly />
            </p> */}
            <p>
              <label htmlFor="company_id">Company ID:</label>
              <input type="hidden" name="company_id" value={1} readOnly />
            </p>
            <p>
              <label htmlFor="storename">Store ID:</label>
              <input type="hidden" name="storename" value={paymentData.storename} readOnly />
            </p>
            <p>
              <label htmlFor="timezone">Timezone:</label>
              <input type="hidden" name="timezone" value={paymentData.timezone} readOnly />
            </p>
            <p>
              <label htmlFor="txntype">Transaction Type:</label>
              <input type="hidden" name="txntype" value={paymentData.txntype} readOnly />
            </p>
            <p>
              <label htmlFor="currency">Currency (see ISO4217):</label>
              <input type="hidden" name="currency" value={paymentData.currency} readOnly />
            </p>
            <p>
              <label htmlFor="chargetotal">Transaction Charge Total:</label>
              <input type="hidden" name="chargetotal" value={paymentData.chargetotal} readOnly />
            </p>
            <p>
              <label htmlFor="txndatetime">Transaction DateTime:</label>
              <input type="hidden" name="txndatetime" value={paymentData.txndatetime} readOnly />
            </p>
            <p>
              <label htmlFor="checkoutoption">Checkout option:</label>
              <input type="hidden" name="checkoutoption" value={paymentData.checkoutoption} readOnly />
            </p>
            <p>
              <label htmlFor="hash_algorithm">Hash Algorithm:</label>
              <input type="hidden" name="hash_algorithm" value={paymentData.hash_algorithm} readOnly />
            </p>
            <p>
              <label htmlFor="hashExtended">Hash Extended:</label>
              <input type="hidden" name="hashExtended" value={paymentData.HashDigest} readOnly />
            </p>
            <p>
              <label htmlFor="responseSuccessURL">Success URL:</label>
              <input type="hidden" name="responseSuccessURL" value={paymentData.responseSuccessURL} readOnly />
            </p>
            <p>
              <label htmlFor="responseFailURL">Fail URL:</label>
              <input type="hidden" name="responseFailURL" value={paymentData.responseFailURL} readOnly />
            </p>
          </fieldset>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentPage;
