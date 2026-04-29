import i18n from '@/i18n';
import { LogOut, User } from 'lucide-react';
// i18n
export default function UserDropdown({
  user,
  profileData,
  showUserMenu,
  setShowUserMenu,
  handleLogout,
  userMenuRef,
  t,
}: any) {
  return (
    <div className="relative" ref={userMenuRef}>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          {user?.name && profileData ? (
            // <span className="text-sm font-semibold text-gray-700 capitalize">
            //   {user.name.charAt(0).toUpperCase()}
            // </span>
            <img
              src={profileData.profilePictureUrl || ''}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-gray-600" />
          )}
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {profileData?.name || user?.name || 'User'}
        </span>
      </button>

      {showUserMenu && (
        <div
          className={`absolute mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 ${i18n.language === 'ar' ? 'left-0' : 'right-0'}`}
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <div className="max-w-[150px]">
              <p
                className={`text-xs text-gray-500 truncate `}
                style={{
                  direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
                  unicodeBidi: 'plaintext',
                }}
                title={user?.email}
              >
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {t('Logout')}
          </button>
        </div>
      )}
    </div>
  );
}
