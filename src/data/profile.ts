export const profile = {
  title: 'Mx',
  firstName: 'Parv',
  lastName: 'Kaur',
  name: 'Parv Kaur',
  jobTitle: 'Self-Service Account Administrator',
  email: 'parv.kaur@bsnl.example',
  phone: '+91 98100 20030',
  organisation: 'Your organisation',
  role: 'Viasat',
  scope: 'All accounts',
}

export const accessPermissions = [
  { name: 'Home', perms: 'read · create · update' }, { name: 'Catalogue', perms: 'read · create · update' }, { name: 'Orders & quotes', perms: 'read · create · update' },
  { name: 'Account', perms: 'read · create · update' }, { name: 'Install base', perms: 'read · create · update' }, { name: 'Knowledge & resources', perms: 'read · create · update' },
  { name: 'Monitoring', perms: 'read · create · update' }, { name: 'PartnerProgramme', perms: 'read · create · update' }, { name: 'News', perms: 'read' },
  { name: 'TechnicalResources', perms: 'read' }, { name: 'DeveloperForum', perms: 'read' }, { name: 'ServiceLifecycle', perms: 'read' },
  { name: 'Organization', perms: 'update' }, { name: 'AccessManagement', perms: 'launch' },
]

export const notificationCategories = [
  'Order status updates', 'Order notes & attachments', 'At-risk order/service alerts', 'Device status changes',
  'Resource alarms', 'Contract & renewal updates', 'Resource/API updates', 'Support case updates',
]
