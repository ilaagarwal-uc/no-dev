OUTPUT_PATH = '/tmp/d0e0eb8e-c6e7-4ff1-a0e3-f7f992d5a809.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the wall skeleton based on the provided image dimensions.
    Dimensions:
    - Total Height: 9'
    - Left Section Width (Opening): 7'
    - Right Section Width (Solid Wall): 7'6" (7.5')
    - Opening Height: 8'
    - Wall above opening: 1'
    - Total Width: 14'6" (14.5')
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor: 1 foot = 0.3048 meters
    ft_to_m = 0.3048
    
    # Wall Dimensions in meters
    wall_width = 14.5 * ft_to_m
    wall_height = 9.0 * ft_to_m
    wall_thickness = 0.15  # Standard wall thickness (~6 inches)
    
    # Opening Dimensions in meters
    opening_width = 7.0 * ft_to_m
    opening_height = 8.0 * ft_to_m

    # 1. Create the Main Wall
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    
    # Scale and position the wall (centered at origin, then moved so bottom-left is at 0,0,0)
    wall.scale = (wall_width, wall_thickness, wall_height)
    wall.location = (wall_width / 2, wall_thickness / 2, wall_height / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # 2. Create the Opening (Cutter)
    bpy.ops.mesh.primitive_cube_add(size=1)
    cutter = bpy.context.active_object
    cutter.name = "Opening_Cutter"
    
    # Scale and position the cutter
    # We make the cutter slightly thicker than the wall to ensure a clean boolean operation
    cutter.scale = (opening_width, wall_thickness * 1.2, opening_height)
    # Positioned at the bottom-left of the wall as per the image layout
    cutter.location = (opening_width / 2, wall_thickness / 2, opening_height / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # 3. Apply Boolean Modifier to create the opening
    bool_mod = wall.modifiers.new(name="Wall_Opening_Cut", type='BOOLEAN')
    bool_mod.object = cutter
    bool_mod.operation = 'DIFFERENCE'
    
    # Set active object to wall and apply modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Cleanup: Remove the cutter object
    bpy.ops.object.select_all(action='DESELECT')
    cutter.select_set(True)
    bpy.ops.object.delete()

    # 5. Export to GLB
    # The file will be saved in the current working directory
    bpy.ops.export_scene.gltf(
        filepath='/tmp/d0e0eb8e-c6e7-4ff1-a0e3-f7f992d5a809.glb',
        export_format='GLB',
        use_selection=False
    )

# Call the function directly for headless execution
create_wall_skeleton()