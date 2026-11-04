import React from 'react';
import { Box, Button, Divider, Link, Paper, Typography } from '@mui/material';
import { adsEnabled, openConsentPreferences } from '../../services/ads';

const APP_NAME = 'Tarif Kitabım';
const LAST_UPDATED = '4 Kasım 2026';
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

/** Gizlilik Politikası — route: /privacy (Google Play mağaza kaydında da bu URL verilir). */
const PrivacyPolicy = () => (
  <Box sx={{ maxWidth: 760, mx: 'auto', py: { xs: 2, md: 4 } }}>
    <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4, md: 5 }, borderRadius: 4 }}>
      <Typography component="h1" variant="h4" sx={{ mb: 1 }}>
        Gizlilik Politikası
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Son güncelleme: {LAST_UPDATED}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <P>
        Bu politika, <strong>{APP_NAME}</strong> web uygulaması ve Android uygulaması
        (“Uygulama”) kullanılırken hangi verilerin toplandığını, nasıl kullanıldığını ve
        haklarınızı açıklar. Uygulamayı kullanarak bu politikayı kabul etmiş olursunuz.
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
              kişisel yemekler ve haftalık yemek planlarınız Google Firebase Cloud Firestore
              üzerinde hesabınıza bağlı olarak saklanır.
            </>,
            <>
              <strong>Reklam ve cihaz verileri:</strong> Reklam gösterimi için Google; reklam
              kimliği (Android Advertising ID), IP adresi, cihaz ve tarayıcı bilgileri, çerezler
              ve reklam etkileşimleri gibi verileri toplayabilir.
            </>,
            <>
              <strong>Yerel tercihler:</strong> Çerez/reklam onayı gibi bazı tercihleriniz yalnızca
              cihazınızda (tarayıcı depolaması) tutulur.
            </>,
          ]}
        />
        <P>
          Konum, rehber, fotoğraf galerisi, mikrofon veya ödeme bilgisi gibi veriler toplanmaz.
          Dışa aktardığınız PDF dosyaları cihazınızda oluşturulur ve sunucularımıza gönderilmez.
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
          reklamlar sunmak için çerezleri ve reklam kimliğini kullanabilir. Avrupa Ekonomik
          Alanı, Birleşik Krallık ve İsviçre'deki kullanıcılardan kişiselleştirilmiş reklam
          öncesinde onay istenir; onay vermezseniz kişiselleştirilmemiş reklamlar gösterilir.
        </P>
        <P>
          Android'de reklam kimliğinizi <em>Ayarlar → Gizlilik → Reklamlar</em> bölümünden
          sıfırlayabilir veya silebilirsiniz. Google'ın verileri nasıl kullandığı hakkında:{' '}
          <ExtLink href="https://policies.google.com/technologies/partner-sites">
            policies.google.com/technologies/partner-sites
          </ExtLink>
          . Kişiselleştirilmiş reklamları{' '}
          <ExtLink href="https://adssettings.google.com">Google Reklam Ayarları</ExtLink>{' '}
          üzerinden kapatabilirsiniz.
        </P>
        {adsEnabled() && (
          <Button variant="outlined" size="small" onClick={openConsentPreferences} sx={{ mt: 1 }}>
            Reklam tercihlerimi değiştir
          </Button>
        )}
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
              <ExtLink href="https://policies.google.com/privacy">policies.google.com/privacy</ExtLink>
            </>,
            <>
              Vercel Web Analytics (yalnızca web; çerez kullanmayan, kişiyi tanımlamayan toplu
              ziyaret istatistikleri: sayfa, yönlendiren site, ülke, cihaz türü) —{' '}
              <ExtLink href="https://vercel.com/docs/analytics/privacy-policy">
                vercel.com/docs/analytics/privacy-policy
              </ExtLink>
            </>,
          ]}
        />
        <P>
          Veriler Google'ın sunucularında (Türkiye dışında, ör. AB veya ABD'deki veri
          merkezlerinde) işlenebilir. Tüm aktarımlar şifreli bağlantı (HTTPS/TLS) üzerinden yapılır.
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
          6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve geçerli olduğu durumlarda
          GDPR kapsamında; verilerinize erişme, düzeltilmesini, silinmesini veya işlenmesinin
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
    </Paper>
  </Box>
);

export default PrivacyPolicy;
