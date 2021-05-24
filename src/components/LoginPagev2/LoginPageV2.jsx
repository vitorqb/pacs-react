import React, { useState } from 'react';
import styles from "./LoginPageV2.module.scss";

export const LoginPage = ({onSubmit}) => {

  const [adminTokenInput, setAdminTokenInput] = useState("");

  return (
    <div className={styles.loginPage}>
      <div>
        <span className={styles.inputLabel}>Admin Token</span>
        <input
          value={adminTokenInput}
          onChange={e => setAdminTokenInput(e.target.value)}
        />
      </div>
      <div className={styles.buttonWrapper}>
        <button
          type="submit"
          onClick={() => onSubmit(adminTokenInput)}
        >
          Submit
        </button>
      </div>
    </div>
  );

};
