import { useTranslation } from 'react-i18next'

/** [R-5] The rules common to all the powers. */
export const PowerRules = () => {
  const { t } = useTranslation()
  return (
    <>
      <h3>{t('help.rules.title')}</h3>
      <ul>
        <li>{t('help.rules.compulsory')}</li>
        <li>{t('help.rules.anchor')}</li>
        <li>{t('help.rules.inverse')}</li>
        <li>{t('help.rules.same-element')}</li>
      </ul>
    </>
  )
}
