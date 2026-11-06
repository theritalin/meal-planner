import React from 'react';
import { Box, Button, Divider, Link, Paper, Typography } from '@mui/material';
import { adsEnabled, openConsentPreferences } from '../../services/ads';
import { useI18n } from '../../i18n';

// Son güncelleme tarihi (dile göre biçimlendirilir).
const LAST_UPDATED = new Date(2026, 10, 4);
const CONTACT_EMAIL = (process.env.REACT_APP_CONTACT_EMAIL || '').trim() || 'bsckbilgi@gmail.com';

const Section = ({ id, title, children }) => (
  <Box component="section" aria-labelledby={id} sx={{ mt: 4 }}>
    <Typography id={id} component="h2" variant="h6" sx={{ mb: 1.5 }}>
      {title}
    </Typography>
    {children}
  </Box>
);

const P = ({ children }) => (
  <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.75 }}>
    {children}
  </Typography>
);

const List = ({ items }) => (
  <Box component="ul" sx={{ pl: 3, my: 1, '& li': { mb: 1, lineHeight: 1.7 } }}>
    {items.map((item, i) => (
      <Typography component="li" variant="body1" key={i}>
        {item}
      </Typography>
    ))}
  </Box>
);

const ExtLink = ({ href, children }) => (
  <Link href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </Link>
);

const Mail = () => <Link href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Link>;

const AdPrefsButton = () => {
  const { t } = useI18n();
  if (!adsEnabled()) return null;
  return (
    <Button variant="outlined" size="small" onClick={openConsentPreferences} sx={{ mt: 1 }}>
      {t('legal.privacy.changeAdPrefs')}
    </Button>
  );
};

// Politika metni dil başına ayrı blok olarak tutulur (bölüm id'leri ve #pp-delete
// çapası iki dilde de aynıdır; Google Play kaydı bu çapaya bağlantı verir).
const PolicyTR = () => (
  <>
    <P>
      Bu politika, <strong>Tarif Kitabım</strong> web uygulaması ve Android uygulaması (“Uygulama”)
      kullanılırken hangi verilerin toplandığını, nasıl kullanıldığını ve haklarınızı açıklar.
      Uygulamayı kullanarak bu politikayı kabul etmiş olursunuz.
    </P>

    <Section id="pp-collected" title="1. Topladığımız veriler">
      <List
        items={[
          <>
            <strong>Hesap bilgileri:</strong> Google ile giriş yaptığınızda Google hesabınızdan
            adınız, e-posta adresiniz, profil fotoğrafınız ve benzersiz kullanıcı kimliğiniz
            (Firebase Authentication aracılığıyla) alınır.
          </>,
          <>
            <strong>Uygulama içeriğiniz:</strong> Oluşturduğunuz tarifler, kaydettiğiniz tarifler,
            kişisel yemekler ve haftalık yemek planlarınız Google Firebase Cloud Firestore üzerinde
            hesabınıza bağlı olarak saklanır.
          </>,
          <>
            <strong>Reklam ve cihaz verileri:</strong> Reklam gösterimi için Google; reklam kimliği
            (Android Advertising ID), IP adresi, cihaz ve tarayıcı bilgileri, çerezler ve reklam
            etkileşimleri gibi verileri toplayabilir.
          </>,
          <>
            <strong>Yerel tercihler:</strong> Çerez/reklam onayı ve dil seçimi gibi bazı tercihleriniz yalnızca
            cihazınızda (tarayıcı depolaması) tutulur.
          </>,
        ]}
      />
      <P>
        Konum, rehber, fotoğraf galerisi, mikrofon veya ödeme bilgisi gibi veriler toplanmaz. Dışa
        aktardığınız PDF dosyaları cihazınızda oluşturulur ve sunucularımıza gönderilmez.
      </P>
    </Section>

    <Section id="pp-use" title="2. Verileri nasıl kullanıyoruz">
      <List
        items={[
          'Hesabınızı oluşturmak, oturumunuzu açık tutmak ve verilerinizi cihazlar arasında senkronize etmek.',
          'Tarif kitabınızı ve yemek planlarınızı göstermek, düzenlemek ve PDF olarak dışa aktarmanızı sağlamak.',
          'Uygulamanın ücretsiz kalabilmesi için reklam göstermek.',
          'Hataları gidermek ve uygulamanın güvenliğini sağlamak.',
        ]}
      />
      <P>Verilerinizi satmıyoruz.</P>
    </Section>

    <Section id="pp-ads" title="3. Reklamlar ve çerezler">
      <P>
        Uygulama, Android'de <strong>Google AdMob</strong>, web'de <strong>Google AdSense</strong>{' '}
        reklamları gösterir. Google ve iş ortakları, ilgi alanına dayalı (kişiselleştirilmiş)
        reklamlar sunmak için çerezleri ve reklam kimliğini kullanabilir. Avrupa Ekonomik Alanı,
        Birleşik Krallık ve İsviçre'deki kullanıcılardan kişiselleştirilmiş reklam öncesinde onay
        istenir; onay vermezseniz kişiselleştirilmemiş reklamlar gösterilir.
      </P>
      <P>
        Android'de reklam kimliğinizi <em>Ayarlar → Gizlilik → Reklamlar</em> bölümünden
        sıfırlayabilir veya silebilirsiniz. Google'ın verileri nasıl kullandığı hakkında:{' '}
        <ExtLink href="https://policies.google.com/technologies/partner-sites">
          policies.google.com/technologies/partner-sites
        </ExtLink>
        . Kişiselleştirilmiş reklamları{' '}
        <ExtLink href="https://adssettings.google.com">Google Reklam Ayarları</ExtLink> üzerinden
        kapatabilirsiniz.
      </P>
      <AdPrefsButton />
    </Section>

    <Section id="pp-third" title="4. Üçüncü taraf hizmetler">
      <P>Uygulama aşağıdaki hizmetleri kullanır; her birinin kendi gizlilik politikası vardır:</P>
      <List
        items={[
          <>
            Google Firebase (Authentication, Cloud Firestore) —{' '}
            <ExtLink href="https://firebase.google.com/support/privacy">
              firebase.google.com/support/privacy
            </ExtLink>
          </>,
          <>
            Google AdMob ve Google AdSense —{' '}
            <ExtLink href="https://policies.google.com/privacy">
              policies.google.com/privacy
            </ExtLink>
          </>,
          <>
            Vercel Web Analytics (yalnızca web; çerez kullanmayan, kişiyi tanımlamayan toplu ziyaret
            istatistikleri: sayfa, yönlendiren site, ülke, cihaz türü) —{' '}
            <ExtLink href="https://vercel.com/docs/analytics/privacy-policy">
              vercel.com/docs/analytics/privacy-policy
            </ExtLink>
          </>,
        ]}
      />
      <P>
        Veriler Google'ın sunucularında (Türkiye dışında, ör. AB veya ABD'deki veri merkezlerinde)
        işlenebilir. Tüm aktarımlar şifreli bağlantı (HTTPS/TLS) üzerinden yapılır.
      </P>
    </Section>

    <Section id="pp-retention" title="5. Saklama süresi ve güvenlik">
      <P>
        Hesap ve içerik verileriniz, hesabınız aktif olduğu sürece saklanır. Silme talebinizden
        sonra verileriniz en geç 30 gün içinde kalıcı olarak silinir. Veriler, Firebase güvenlik
        kurallarıyla yalnızca hesap sahibinin erişebileceği şekilde korunur.
      </P>
    </Section>

    <Section id="pp-children" title="6. Çocukların gizliliği">
      <P>
        Uygulama 13 yaşın altındaki çocuklara yönelik değildir ve bilerek 13 yaş altındaki
        çocuklardan kişisel veri toplamaz. Böyle bir verinin toplandığını fark ederseniz lütfen
        bizimle iletişime geçin; veriler derhal silinecektir.
      </P>
    </Section>

    <Section id="pp-delete" title="7. Hesap ve veri silme">
      <P>
        Hesabınızın ve ilişkili tüm verilerinizin (tarifler, yemek planları, profil bilgileri)
        silinmesini istemek için kayıtlı Google e-posta adresinizden <Mail /> adresine{' '}
        <strong>“Hesap silme talebi”</strong> konulu bir e-posta gönderin. Talebiniz kimliğiniz
        doğrulandıktan sonra en geç 30 gün içinde işleme alınır. Uygulama içinde kendi
        oluşturduğunuz tarifleri ve planları istediğiniz zaman tek tek silebilirsiniz.
      </P>
    </Section>

    <Section id="pp-rights" title="8. Haklarınız">
      <P>
        6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve geçerli olduğu durumlarda GDPR
        kapsamında; verilerinize erişme, düzeltilmesini, silinmesini veya işlenmesinin
        kısıtlanmasını isteme ve onayınızı geri çekme haklarına sahipsiniz.
      </P>
    </Section>

    <Section id="pp-changes" title="9. Değişiklikler">
      <P>
        Bu politikayı zaman zaman güncelleyebiliriz. Güncel sürüm her zaman bu sayfada, “Son
        güncelleme” tarihiyle birlikte yayımlanır.
      </P>
    </Section>

    <Section id="pp-contact" title="10. İletişim">
      <P>
        Gizlilikle ilgili her türlü soru ve talep için: <Mail />
      </P>
    </Section>
  </>
);

const PolicyEN = () => (
  <>
    <P>
      This policy explains what data is collected when you use the <strong>Tarif Kitabım</strong>{' '}
      (Recipe Book) web app and Android app (the “App”), how it is used, and what your rights are.
      By using the App, you agree to this policy.
    </P>

    <Section id="pp-collected" title="1. Data we collect">
      <List
        items={[
          <>
            <strong>Account information:</strong> When you sign in with Google, your name, email
            address, profile photo and unique user ID are obtained from your Google account (via
            Firebase Authentication).
          </>,
          <>
            <strong>Your app content:</strong> The recipes you create, recipes you save, personal
            meals and weekly meal plans are stored in Google Firebase Cloud Firestore, linked to
            your account.
          </>,
          <>
            <strong>Advertising and device data:</strong> To show ads, Google may collect data such
            as your advertising ID (Android Advertising ID), IP address, device and browser
            information, cookies and ad interactions.
          </>,
          <>
            <strong>Local preferences:</strong> Some preferences, such as your cookie/ad consent and
            language, are stored only on your device (browser storage).
          </>,
        ]}
      />
      <P>
        We do not collect location, contacts, photo gallery, microphone or payment information. PDF
        files you export are generated on your device and are not sent to our servers.
      </P>
    </Section>

    <Section id="pp-use" title="2. How we use data">
      <List
        items={[
          'To create your account, keep you signed in and sync your data across devices.',
          'To display and edit your recipe book and meal plans and let you export them as PDFs.',
          'To show ads so the App can stay free.',
          'To fix bugs and keep the App secure.',
        ]}
      />
      <P>We do not sell your data.</P>
    </Section>

    <Section id="pp-ads" title="3. Ads and cookies">
      <P>
        The App shows <strong>Google AdMob</strong> ads on Android and{' '}
        <strong>Google AdSense</strong> ads on the web. Google and its partners may use cookies and
        your advertising ID to serve interest-based (personalized) ads. Users in the European
        Economic Area, the United Kingdom and Switzerland are asked for consent before personalized
        ads are shown; if you don't consent, non-personalized ads are shown instead.
      </P>
      <P>
        On Android, you can reset or delete your advertising ID under{' '}
        <em>Settings → Privacy → Ads</em>. To learn how Google uses data, see{' '}
        <ExtLink href="https://policies.google.com/technologies/partner-sites">
          policies.google.com/technologies/partner-sites
        </ExtLink>
        . You can turn off personalized ads in{' '}
        <ExtLink href="https://adssettings.google.com">Google Ad Settings</ExtLink>.
      </P>
      <AdPrefsButton />
    </Section>

    <Section id="pp-third" title="4. Third-party services">
      <P>The App uses the following services, each with its own privacy policy:</P>
      <List
        items={[
          <>
            Google Firebase (Authentication, Cloud Firestore) —{' '}
            <ExtLink href="https://firebase.google.com/support/privacy">
              firebase.google.com/support/privacy
            </ExtLink>
          </>,
          <>
            Google AdMob and Google AdSense —{' '}
            <ExtLink href="https://policies.google.com/privacy">
              policies.google.com/privacy
            </ExtLink>
          </>,
          <>
            Vercel Web Analytics (web only; cookie-free, aggregated visit statistics that do not
            identify individuals: page, referring site, country, device type) —{' '}
            <ExtLink href="https://vercel.com/docs/analytics/privacy-policy">
              vercel.com/docs/analytics/privacy-policy
            </ExtLink>
          </>,
        ]}
      />
      <P>
        Data may be processed on Google's servers outside Turkey (e.g. in data centers in the EU or
        the US). All transfers take place over encrypted connections (HTTPS/TLS).
      </P>
    </Section>

    <Section id="pp-retention" title="5. Retention and security">
      <P>
        Your account and content data are kept for as long as your account is active. After you
        request deletion, your data is permanently deleted within 30 days at the latest. Firebase
        security rules ensure that only the account owner can access their data.
      </P>
    </Section>

    <Section id="pp-children" title="6. Children's privacy">
      <P>
        The App is not directed at children under 13 and does not knowingly collect personal data
        from children under 13. If you become aware that such data has been collected, please
        contact us and it will be deleted promptly.
      </P>
    </Section>

    <Section id="pp-delete" title="7. Account and data deletion">
      <P>
        To request deletion of your account and all associated data (recipes, meal plans, profile
        information), send an email with the subject <strong>“Account deletion request”</strong> (or
        “Hesap silme talebi”) to <Mail /> from the Google email address registered to your account.
        Your request will be processed within 30 days at the latest, once your identity has been
        verified. You can also delete the recipes and plans you created in the App one by one at any
        time.
      </P>
    </Section>

    <Section id="pp-rights" title="8. Your rights">
      <P>
        Under Turkey's Personal Data Protection Law No. 6698 (KVKK) and, where applicable, the GDPR,
        you have the right to access your data, to request its correction, deletion or restriction
        of processing, and to withdraw your consent.
      </P>
    </Section>

    <Section id="pp-changes" title="9. Changes">
      <P>
        We may update this policy from time to time. The current version is always published on this
        page together with its “Last updated” date.
      </P>
    </Section>

    <Section id="pp-contact" title="10. Contact">
      <P>
        For any privacy-related questions or requests: <Mail />
      </P>
    </Section>
  </>
);

/** Gizlilik Politikası — route: /privacy (Google Play mağaza kaydında da bu URL verilir). */
const PrivacyPolicy = () => {
  const { lang, t, formatDate } = useI18n();
  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', py: { xs: 2, md: 4 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4, md: 5 }, borderRadius: 4 }}>
        <Typography component="h1" variant="h4" sx={{ mb: 1 }}>
          {t('legal.privacy.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('legal.privacy.lastUpdated', {
            date: formatDate(LAST_UPDATED, { day: 'numeric', month: 'long', year: 'numeric' }),
          })}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {lang === 'en' ? <PolicyEN /> : <PolicyTR />}
      </Paper>
    </Box>
  );
};

export default PrivacyPolicy;
