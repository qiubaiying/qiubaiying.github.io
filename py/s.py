name = None

def text_prompt(msg):
  try:
    return raw_input(msg)
  except NameError:
    return input(msg)


print('这是一个小小的验证程序')
name = text_prompt('请你输入cyorage_lingxi，就可以进我的Blog:')
if name == 'cyorage_lingxi':
  print('我的Blog的URL：https://cyorage.site')
else:
  print('不是这个哦，请关闭程序后重新打开！')
