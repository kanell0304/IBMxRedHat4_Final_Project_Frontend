import { useState } from 'react';
import PhoneFrame from '../Layout/PhoneFrame';
import MainLayout from '../Layout/MainLayout';
import Header from '../Layout/Header';
import CommunityList from './CommunityList';

export default function Community() {
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeCategoryName, setActiveCategoryName] = useState('커뮤니티');
  const [resetSignal, setResetSignal] = useState(0);

  const handleCategorySelected = (categoryId, categoryName) => {
    setActiveCategoryId(categoryId);
    setActiveCategoryName(categoryId ? categoryName : '커뮤니티');
  };

  const handleBack = () => {
    if (activeCategoryId) {
      setActiveCategoryId(null);
      setActiveCategoryName('커뮤니티');
      setResetSignal(Date.now());
    }
  };

  return (
    <PhoneFrame
      showTitleRow={!!activeCategoryId}
      title={activeCategoryName}
      contentClass="px-0 pt-[2px] pb-0"
      headerContent={activeCategoryId ? null : <Header fullWidth dense />}
      onBack={handleBack}
    >
      <MainLayout fullWidth showHeader={false} showFooter={!activeCategoryId}>
        <CommunityList onCategorySelected={handleCategorySelected} resetSignal={resetSignal} />
      </MainLayout>
    </PhoneFrame>
  );
}
