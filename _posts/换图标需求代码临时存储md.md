UserViewImpl.java
```java
private void changeTabIcon(Drawable drawable, String position) {
		if (TextUtils.equals(position, Position.HOME.name())) {
			mHome.setIcon(drawable);
		} else if (TextUtils.equals(position, Position.CLASS.name())) {
			mAcadmy.setIcon(drawable);
		} else if (TextUtils.equals(position, Position.DISCOVER.name())) {
			mDiscovery.setIcon(drawable);
		} else if (TextUtils.equals(position, Position.MINE.name())) {
			mMine.setIcon(drawable);
		}
	}

	@Override
	public void renderTabIcon(Tabicon icon) {
		String position = icon.position;
		byte[] img= Base64.decode(icon.activeIconUrl, Base64.DEFAULT);
		Bitmap bitmap;
		if (img != null) {
			bitmap = BitmapFactory.decodeByteArray(img,0, img.length);
			Drawable drawable = new BitmapDrawable(bitmap);
			changeTabIcon(drawable, position);
		}
	}
```

UserPresenterImpl.java
```java
public void fetchTabIcon(String app, String platform) {
		add(TabiconApiService.getInstance(mContext).fetchTabicon(app, platform)
				.subscribeOn(Schedulers.io())
				.observeOn(AndroidSchedulers.mainThread())
				.subscribe(new SBRespHandler<Tabicon[]>() {
					@Override
					public void onSuccess(Tabicon[] data) {
						for (Tabicon icon : data) {
							mView.renderTabIcon(icon);
						}
					}

					@Override
					public void onFailure(RespException e) {
						e.printStackTrace();
					}
				}));
	}
```

TabiconApiService.java
```java
public class TabiconApiService extends BaseApiService {
	private volatile static TabiconApiService sInstance;

	private TabiconApi mapi;

	public TabiconApiService(TabiconApi api) {
		mapi = mapi;
	}

	public static synchronized TabiconApiService getInstance(Context context) {
		if (sInstance == null) {
			synchronized (TabiconApiService.class) {
				if (sInstance == null) {
					sInstance = new TabiconApiService(SBClient.getInstanceV3(context).getClient().create(TabiconApi.class));
				}
			}
		}
		return  sInstance;
	}

	public Observable<Tabicon[]> fetchTabicon(String app, String platform) {
		return mapi.fetchTabicon(app, platform);
	}

}
```

TabiconApi.java
```java
public interface TabiconApi {

	@GET("/operation/tab_icons")
	Observable<Tabicon[]> fetchTabicon(@Query("app") String app, @Query("platform") String platform);

}
```

Tabicon.java
```java
@Keep
public class Tabicon {

	/**
	 * 点击时图标url
	 */
	public String activeIconUrl;

	/**
	 * 非点击时图标url
	 */
	public String inActiveIconUrl;
}

```

Words里的HomeActivity
```java
@Override
	public boolean onPrepareOptionsMenu(Menu menu) {
		UserPresenterImpl userPresenter = new UserPresenterImpl();
		userPresenter.fetchTabIcon("SENTENCE", "ANDROID");

		return super.onPrepareOptionsMenu(menu);
	}
```

words的HomeViewImpl的构造函数开头添加
```java
mTabIconHelper.update("SENTENCE", "ANDROID");
```