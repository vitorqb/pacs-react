import React, { useState } from 'react';
import styles from "./LoginPageV2.module.scss";

export const LoginPage = ({onGetToken}) => {

  const [adminTokenInput, setAdminTokenInput] = useState("");

  return (
    <div className={styles.loginPage}>
      <form>
        <div className={styles.content}>
          <span className={styles.inputLabel}>Admin Token</span>
          <input
            value={adminTokenInput}
            type="password"
            onChange={e => setAdminTokenInput(e.target.value)}
          />
          <div className={styles.buttonWrapper}>
            <button
              type="submit"
              onClick={e => {
                e.preventDefault();
                onGetToken(adminTokenInput);
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );

};
