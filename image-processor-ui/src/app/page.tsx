// pages/index.js

import Head from 'next/head';
import UploadForm from './components/UploadForm';
import  styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.mainContainer}>
      <Head>
        <title>Image Processor</title>
        <meta name="description" content="Upload and process images" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <UploadForm />
      </main>
    </div>
  );
}
