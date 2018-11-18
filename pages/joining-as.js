import "../reset.scss"
import Head from 'next/head'
import Link from 'next/link'
import MyLayout from '../components/MyLayout'
import Nav from '../components/Nav'
import Button from '../components/Button'
import HowItWorks from '../components/HowItWorks'
import Footer from '../components/Footer'

export default () => (
  <div>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </Head>
    <Nav />
    <MyLayout>
      <div style={{ height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center' }} alignment="center">
        <div className="options-container">
          <h2 style={{ marginBottom: "20px" }}>I'm joining as a:</h2>
          <Link href="/create-account-pupil">
            <Button>Pupil</Button>
          </Link>
          <Link href="/create-account-artist">
            <Button>Artist</Button>
          </Link>
        </div>
      </div>
    </MyLayout>
  </div>
)
